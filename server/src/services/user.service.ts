import { userRepository } from '../repositories/user.repository.js';
import { UpdateProfileInput } from '@algoforge/shared';
import { AppError } from '../utils/AppError.js';

export const updateProfile = async (userId: string, data: UpdateProfileInput) => {
  if (data.username) {
    const existing = await userRepository.findByUsername(data.username);
    if (existing && existing.id !== userId) {
      throw new AppError('Username already taken', 400);
    }
  }
  return userRepository.update(userId, data);
};

export const getPublicProfile = async (username: string) => {
  const user = await userRepository.findByUsername(username);
  if (!user || !user.isProfilePublic) {
    throw new AppError('Profile not found or is private', 404);
  }
  
  return {
    id: user.id,
    name: user.name,
    username: user.username,
    bio: user.bio,
    avatarUrl: user.avatarUrl,
    createdAt: user.createdAt,
  };
};
