import { integrationRepository } from '../repositories/integration.repository.js';
import { syncCodeforces } from './platforms/codeforces.js';
import { syncLeetcode } from './platforms/leetcode.js';
import { syncCodechef } from './platforms/codechef.js';
import { syncGfg } from './platforms/gfg.js';
import { syncAtcoder } from './platforms/atcoder.js';
import { syncGithub } from './platforms/github.js';
import { AppError } from '../utils/AppError.js';
import { logger } from '../utils/logger.js';
import { cache } from '../utils/cache.js';
import { Prisma } from '@prisma/client';

interface PlatformStats {
  solvedCount?: number;
  rating?: number;
  maxRating?: number;
  tier?: string | null;
  contributions?: number;
  activityData?: Array<{ date: string; count: number }> | null;
}

export const getIntegrations = async (userId: string) => {
  const cacheKey = `integrations:${userId}`;
  const cached = await cache.get(cacheKey);
  if (cached) return cached as any;
  const result = await integrationRepository.findByUserId(userId);
  await cache.setWithTag(cacheKey, `user:${userId}`, result, 300);
  return result;
};

const syncPlatform = async (platform: string, username: string): Promise<PlatformStats | null> => {
  let platformStats: PlatformStats | null = null;
  if (platform === 'codeforces') platformStats = await syncCodeforces(username);
  else if (platform === 'leetcode') platformStats = await syncLeetcode(username);
  else if (platform === 'codechef') platformStats = await syncCodechef(username);
  else if (platform === 'gfg') platformStats = await syncGfg(username);
  else if (platform === 'atcoder') platformStats = await syncAtcoder(username);
  else if (platform === 'github') platformStats = await syncGithub(username);
  return platformStats;
};

export const linkIntegration = async (userId: string, platform: string, username: string) => {
  const supportedPlatforms = ['leetcode', 'codeforces', 'codechef', 'gfg', 'atcoder', 'github'];
  if (!supportedPlatforms.includes(platform)) {
    throw new AppError('Unsupported platform', 400);
  }

  let stats: PlatformStats = { solvedCount: 0, rating: 0, maxRating: 0, contributions: 0, tier: null, activityData: null };
  let apiError: string | null = null;

  try {
    const platformStats = await syncPlatform(platform, username);
    if (platformStats) {
      stats = { ...stats, ...platformStats };
    }
  } catch (error: any) {
    if (error?.message?.toLowerCase().includes('not found') || error?.message?.includes('Token')) {
      throw error; // Let AppError or other errors bubble up
    }
    apiError = error?.message || 'External API unavailable';
  }

  const integration = await integrationRepository.createOrUpdate(userId, platform, {
    username,
    solvedCount: stats.solvedCount,
    rating: stats.rating,
    maxRating: stats.maxRating || stats.rating,
    tier: stats.tier || null,
    contributions: stats.contributions || 0,
    activityData: stats.activityData ?? Prisma.JsonNull,
  });

  await cache.invalidateTag(`user:${userId}`);
  return { ...integration, _warning: apiError };
};

export const unlinkIntegration = async (userId: string, platform: string) => {
  await integrationRepository.delete(userId, platform);
  await cache.invalidateTag(`user:${userId}`);
};

export const syncAllIntegrations = async (userId: string) => {
  const integrations = await getIntegrations(userId);
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
        solvedCount: stats.solvedCount,
        rating: stats.rating || 0,
        maxRating: Math.max(integration.maxRating, stats.maxRating || stats.rating || 0),
        tier: stats.tier || null,
        contributions: stats.contributions || 0,
        activityData: stats.activityData as any,
      });
      
      results.push(updated);
    } catch (err) {
      logger.error({ err, platform: integration.platform }, `Sync failed for ${integration.platform}`);
      results.push(integration);
    }
  }

  await cache.invalidateTag(`user:${userId}`);
  return results;
};

export const getAggregatedHeatmap = async (userId: string) => {
  const integrations = await getIntegrations(userId);
  const activityMap = new Map<string, { count: number, platforms: Record<string, number> }>();
  
  for (const int of integrations) {
    const activityData = int.activityData as Array<{ date: string; count: number }> | null;
    if (activityData && Array.isArray(activityData)) {
      for (const record of activityData) {
        if (record.date && typeof record.count === 'number') {
          const existing = activityMap.get(record.date) || { count: 0, platforms: {} };
          existing.count += record.count;
          existing.platforms[int.platform] = (existing.platforms[int.platform] || 0) + record.count;
          activityMap.set(record.date, existing);
        }
      }
    }
  }

  return Array.from(activityMap.entries()).map(([date, val]) => ({ date, count: val.count, platforms: val.platforms }));
};
