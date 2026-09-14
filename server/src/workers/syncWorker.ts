import { Worker, Queue } from 'bullmq';
import { env } from '../config/env.js';
import { logger } from '../utils/logger.js';
import { integrationRepository } from '../repositories/integration.repository.js';
import { syncCodeforces } from '../services/platforms/codeforces.js';
import { syncLeetcode } from '../services/platforms/leetcode.js';
import { syncCodechef } from '../services/platforms/codechef.js';
import { syncGfg } from '../services/platforms/gfg.js';
import { syncAtcoder } from '../services/platforms/atcoder.js';
import { syncGithub } from '../services/platforms/github.js';
import { cache } from '../utils/cache.js';
import Redis from 'ioredis';

interface PlatformStats {
  solvedCount?: number;
  rating?: number;
  maxRating?: number;
  tier?: string | null;
  contributions?: number;
  activityData?: Array<{ date: string; count: number }> | null;
}

const syncPlatform = async (platform: string, username: string): Promise<PlatformStats | null> => {
  if (platform === 'codeforces') return await syncCodeforces(username);
  if (platform === 'leetcode') return await syncLeetcode(username);
  if (platform === 'codechef') return await syncCodechef(username);
  if (platform === 'gfg') return await syncGfg(username);
  if (platform === 'atcoder') return await syncAtcoder(username);
  if (platform === 'github') return await syncGithub(username);
  return null;
};

// Only initialize BullMQ if Redis is configured — prevents hanging on startup
export let syncQueue: Queue | null = null;
export let syncWorker: Worker | null = null;

if (env.REDIS_URL) {
  const connection = new Redis(env.REDIS_URL, { maxRetriesPerRequest: null });

  syncQueue = new Queue('platform-sync', { connection });

  syncWorker = new Worker('platform-sync', async (job) => {
    const { userId, integrations } = job.data;
    logger.info(`Processing platform sync for user ${userId}`);

    const results = [];
    
    for (const integration of integrations) {
      try {
        let stats: PlatformStats = { 
          solvedCount: integration.solvedCount, 
          rating: integration.rating, 
          maxRating: integration.maxRating, 
          contributions: integration.contributions,
          tier: integration.tier,
          activityData: integration.activityData as any
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
          activityData: stats.activityData as any,
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
  }, { connection });

  syncWorker.on('failed', (job, err) => {
    logger.error({ err, jobId: job?.id }, 'Background sync job failed');
  });

  logger.info('✅ BullMQ sync worker initialized');
} else {
  logger.warn('⚠️ REDIS_URL not set — BullMQ sync worker disabled. Platform syncs will run inline.');
}

