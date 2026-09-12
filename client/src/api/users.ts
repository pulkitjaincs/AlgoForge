import { UpdateProfileInput, UpdateEmailInput, UpdatePasswordInput } from '@algoforge/shared';
import { apiClient } from './client';

export const usersApi = {
  getPublicProfile: (username: string) => apiClient.get(`/users/${username}/profile`),
  checkUsername: (username: string) => apiClient.get('/users/check-username', { params: { username } }),
  updateProfile: (data: UpdateProfileInput) => apiClient.patch('/users/me/profile', data),
  updateEmail: (data: UpdateEmailInput) => apiClient.patch('/users/me/email', data),
  updatePassword: (data: UpdatePasswordInput) => apiClient.patch('/users/me/password', data),
};
