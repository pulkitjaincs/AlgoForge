import { Job } from 'bullmq';
import { logger } from '../../utils/logger.js';
import { integrationRepository } from '../../repositories/integration.repository.js';
import { syncCodeforces } from '../../services/platforms/codeforces.js';
import { syncLeetcode } from '../../services/platforms/leetcode.js';
import { syncCodechef } from '../../services/platforms/codechef.js';
import { syncGfg } from '../../services/platforms/gfg.js';
import { syncAtcoder } from '../../services/platforms/atcoder.js';
import { syncGithub } from '../../services/platforms/github.js';
import { cache } from '../../utils/cache.js';
import { PlatformStats } from '../../types/platform.js';

const syncPlatform = async (platform: string, username: string): Promise<PlatformStats | null> => {
  if (platform === 'codeforces') return await syncCodeforces(username);
  if (platform === 'leetcode') return await syncLeetcode(username);
  if (platform === 'codechef') return await syncCodechef(username);
  if (platform === 'gfg') return await syncGfg(username);
  if (platform === 'atcoder') return await syncAtcoder(username);
  if (platform === 'github') return await syncGithub(username);
  return null;
};

export const processPlatformSync = async (job: Job) => {
  const { userId, integrations } = job.data;
  logger.info(`Processing platform sync for user ${userId}`);

  const results = [];
  
  for (const integration of integrations) {
    try {
      let stats: PlatformStats = { 
        platform: integration.platform,
        username: integration.username,
        solvedCount: integration.solvedCount, 
        rating: integration.rating, 
        maxRating: integration.maxRating, 
        contributions: integration.contributions,
        tier: integration.tier,
        activityData: integration.activityData as { date: string; count: number }[] | null
      };
      
      const platformStats = await syncPlatform(integration.platform, integration.username);
      if (platformStats) {
        stats = { ...stats, ...platformStats };
      }

      const updated = await integrationRepository.update(integration.id, {
        solvedCount: stats.solvedCount || 0,
        rating: stats.rating || 0,
        maxRating: Math.max(integration.maxRating, stats.maxRating || stats.rating || 0),
        tier: stats.tier || null,
        contributions: stats.contributions || 0,
        activityData: stats.activityData as any, // Prisma JsonValue cast is fine here
        lastSyncedAt: new Date(),
      });
      
      results.push(updated);
    } catch (err: any) {
      logger.error({ err, platform: integration.platform }, `Background sync failed for ${integration.platform}`);
      results.push(integration);
    }
  }

  await cache.invalidateTag(`user:${userId}`);
  logger.info(`Completed platform sync for user ${userId}`);
  return results;
};
