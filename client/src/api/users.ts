import { UpdateProfileInput, UpdateEmailInput, UpdatePasswordInput } from '@algoforge/shared';
import { apiClient } from './client';

export interface PublicProfile {
  id: string;
  name: string;
  username: string | null;
  bio: string | null;
  avatarUrl: string | null;
  createdAt: string;
  defaultHeatmapRange: string;
  heatmap: Array<{ date: string; count: number }>;
  stats: {
    solvedQuestions: number;
    [key: string]: any;
  };
  integrations: Array<{
    platform: string;
    username: string;
    solvedCount: number;
    rating: number;
    maxRating: number;
    tier: string | null;
    contributions: number;
    activityData: any;
  }>;
}

export const usersApi = {
  getPublicProfile: (username: string) => apiClient.get<{ data: PublicProfile }>(`/users/${username}/profile`),
  checkUsername: (username: string) => apiClient.get('/users/check-username', { params: { username } }),
  updateProfile: (data: UpdateProfileInput) => apiClient.patch('/users/me/profile', data),
  updateEmail: (data: UpdateEmailInput) => apiClient.patch('/users/me/email', data),
  updatePassword: (data: UpdatePasswordInput) => apiClient.patch('/users/me/password', data),
};
