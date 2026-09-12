import bcrypt from 'bcryptjs';
import { userRepository } from '../repositories/user.repository.js';
import { integrationRepository } from '../repositories/integration.repository.js';
import { UpdateProfileInput, UpdateEmailInput, UpdatePasswordInput } from '@algoforge/shared';
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

export const updateEmail = async (userId: string, data: UpdateEmailInput) => {
  const existing = await userRepository.findByEmail(data.email);
  if (existing && existing.id !== userId) {
    throw new AppError('Email already in use', 400);
  }
  const updated = await userRepository.update(userId, { email: data.email });
  await cache.invalidateTag(`user:${userId}`);
  return updated;
};

export const updatePassword = async (userId: string, data: UpdatePasswordInput) => {
  const user = await userRepository.findById(userId);
  if (!user) {
    throw new AppError('User not found', 404);
  }

  const isMatch = await bcrypt.compare(data.currentPassword, user.password);
  if (!isMatch) {
    throw new AppError('Incorrect current password', 400);
  }

  const hashedPassword = await bcrypt.hash(data.newPassword, 12);
  const updated = await userRepository.update(userId, { password: hashedPassword });
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
