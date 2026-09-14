import { apiClient } from './client';

export interface Contest {
  id: string;
  title: string;
  platform: 'leetcode' | 'codeforces' | 'codechef' | 'atcoder';
  url: string;
  startTime: string; // ISO string
  durationSeconds: number;
  status: 'UPCOMING' | 'LIVE' | 'COMPLETED';
}

export interface UserContestRating {
  platform: string;
  username: string;
  rating: number;
  maxRating: number;
  tier: string | null;
  lastSyncedAt: string;
}

export const getContests = async (platform?: string, status?: string): Promise<Contest[]> => {
  const params: Record<string, string> = {};
  if (platform && platform !== 'all') params.platform = platform;
  if (status && status !== 'all') params.status = status;

  return apiClient.get('/contests', { params });
};

export const getUserContestRatings = async (): Promise<UserContestRating[]> => {
  return apiClient.get('/contests/ratings');
};
