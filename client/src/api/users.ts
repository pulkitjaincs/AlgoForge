import { UpdateProfileInput } from '@algoforge/shared';
import { apiClient } from './client';

export const usersApi = {
  getPublicProfile: (username: string) => apiClient.get(`/users/${username}/profile`),
  updateProfile: (data: UpdateProfileInput) => apiClient.patch('/users/me/profile', data),
};
