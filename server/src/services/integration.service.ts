import { integrationRepository } from '../repositories/integration.repository.js';
import { cache } from '../utils/cache.js';
import { AppError } from '../utils/AppError.js';
import { Prisma, PlatformIntegration } from '@prisma/client';
import { backgroundQueue } from '../workers/queues.js';
import { syncPlatform } from '../workers/processors/platformSync.js';
import { logger } from '../utils/logger.js';

export interface SyncProgressUpdate {
  platform: string;
  index: number;
  total: number;
  percent: number;
  message: string;
}

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
  if (cached) return cached as PlatformIntegration[];
  const result = await integrationRepository.findByUserId(userId);
  await cache.setWithTag(cacheKey, `user:${userId}:integrations`, result, 300);
  return result;
};



export const linkIntegration = async (userId: string, platform: string, username: string) => {
  const supportedPlatforms = ['leetcode', 'codeforces', 'codechef', 'gfg', 'atcoder', 'github'];
  if (!supportedPlatforms.includes(platform)) {
    throw new AppError('Unsupported platform', 400);
  }

  const integration = await integrationRepository.createOrUpdate(userId, platform, {
    username,
    solvedCount: 0,
    rating: 0,
    maxRating: 0,
    tier: null,
    contributions: 0,
    activityData: Prisma.JsonNull,
  });

  if (backgroundQueue) {
    await backgroundQueue.add('platform-sync', { userId, integrations: [integration] });
  }

  await cache.invalidateTag(`user:${userId}:integrations`);
  return { ...integration, _message: 'Sync queued successfully in the background' };
};

export const unlinkIntegration = async (userId: string, platform: string) => {
  await integrationRepository.delete(userId, platform);
  await cache.invalidateTag(`user:${userId}:integrations`);
  await cache.invalidateTag(`user:${userId}:analytics`);
  await cache.invalidateTag(`user:${userId}:profile`);
};

export const syncUserPlatformsDirect = async (
  userId: string,
  onProgress?: (update: SyncProgressUpdate) => void
) => {
  const integrations = await integrationRepository.findByUserId(userId);
  if (integrations.length === 0) {
    return { integrations: [], heatmap: [] };
  }

  const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
  const hasRecentSync = integrations.some(
    (i: PlatformIntegration) =>
      (i.solvedCount > 0 || (i.rating && i.rating > 0) || i.contributions > 0) &&
      new Date(i.lastSyncedAt) > oneHourAgo
  );
  if (hasRecentSync) {
    throw new AppError('You can only sync integrations once every 1 hour.', 429);
  }

  const total = integrations.length;
  const updatedIntegrations: PlatformIntegration[] = [];

  for (let idx = 0; idx < total; idx++) {
    const integration = integrations[idx];
    const percent = Math.round(((idx + 0.5) / total) * 100);
    onProgress?.({
      platform: integration.platform,
      index: idx + 1,
      total,
      percent,
      message: `Syncing ${integration.platform} (@${integration.username})...`,
    });

    try {
      const platformStats = await syncPlatform(integration.platform, integration.username);
      let updated = integration;
      if (platformStats) {
        updated = await integrationRepository.update(integration.id, {
          solvedCount: platformStats.solvedCount || 0,
          rating: platformStats.rating || 0,
          maxRating: Math.max(integration.maxRating, platformStats.maxRating || platformStats.rating || 0),
          tier: platformStats.tier || null,
          contributions: platformStats.contributions || 0,
          activityData: platformStats.activityData as any,
          lastSyncedAt: new Date(),
        });
      }
      updatedIntegrations.push(updated);
    } catch (err) {
      logger.error({ err, platform: integration.platform }, `Sync failed for ${integration.platform}`);
      updatedIntegrations.push(integration);
    }
  }

  await cache.invalidateTag(`user:${userId}:integrations`);
  await cache.invalidateTag(`user:${userId}:analytics`);
  await cache.invalidateTag(`user:${userId}:profile`);

  const heatmap = await getAggregatedHeatmap(userId);

  onProgress?.({
    platform: 'all',
    index: total,
    total,
    percent: 100,
    message: 'Synchronization complete!',
  });

  return { integrations: updatedIntegrations, heatmap };
};

export const syncAllIntegrations = async (userId: string) => {
  return await syncUserPlatformsDirect(userId);
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
