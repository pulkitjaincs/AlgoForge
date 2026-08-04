import { userRepository } from '../repositories/user.repository.js';
import { integrationRepository } from '../repositories/integration.repository.js';
import { UpdateProfileInput } from '@algoforge/shared';
import { AppError } from '../utils/AppError.js';
import * as analyticsService from './analytics.service.js';
import { cache } from '../utils/cache.js';

export const updateProfile = async (userId: string, data: UpdateProfileInput) => {
  if (data.username) {
    const existing = await userRepository.findByUsername(data.username);
    if (existing && existing.id !== userId) {
      throw new AppError('Username already taken', 400);
    }
  }
  const updated = await userRepository.update(userId, data);
  await cache.invalidateTag(`user:${userId}`);
  return updated;
};

export const checkUsername = async (username: string) => {
  const existing = await userRepository.findByUsername(username);
  return { available: !existing };
};

export const getPublicProfile = async (username: string) => {
  const cacheKey = `public_profile:${username}`;
  const cached = await cache.get(cacheKey);
  if (cached) return cached as any;

  const user = await userRepository.findByUsername(username);
  if (!user || !user.isProfilePublic) {
    throw new AppError('Profile not found or is private', 404);
  }
  
  const [heatmap, stats, integrations] = await Promise.all([
    analyticsService.getHeatmap(user.id),
    analyticsService.getSummary(user.id),
    integrationRepository.findByUserId(user.id)
  ]);

  const result = {
    id: user.id,
    name: user.name,
    username: user.username,
    bio: user.bio,
    avatarUrl: user.avatarUrl,
    createdAt: user.createdAt,
    defaultHeatmapRange: user.defaultHeatmapRange,
    heatmap,
    stats,
    integrations: integrations.map(int => ({
      platform: int.platform,
      username: int.username,
      solvedCount: int.solvedCount,
      rating: int.rating,
      maxRating: int.maxRating,
      tier: (int as any).tier,
      contributions: int.contributions,
      activityData: int.activityData
    }))
  };

  await cache.setWithTag(cacheKey, `user:${user.id}`, result, 300);
  return result;
};
