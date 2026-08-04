import { apiClient } from './client';

export interface Integration {
  id: string;
  userId: string;
  platform: 'leetcode' | 'codeforces' | 'codechef' | 'gfg' | 'atcoder' | 'github';
  username: string;
  solvedCount: number;
  rating: number;
  maxRating: number;
  contributions: number;
  tier?: string;
  lastSyncedAt: string;
}

export interface IntegrationHeatmapItem {
  date: string;
  count: number;
  platforms?: Record<string, number>;
}

export const integrationsApi = {
  getIntegrations: (): Promise<Integration[]> => apiClient.get('/integrations'),
  linkIntegration: (platform: Integration['platform'], username: string, accessToken?: string): Promise<Integration> => apiClient.post('/integrations', { platform, username, accessToken }),
  unlinkIntegration: (platform: Integration['platform']) => apiClient.delete(`/integrations/${platform}`),
  syncIntegrations: (): Promise<Integration[]> => apiClient.post('/integrations/sync'),
  getIntegrationHeatmap: (): Promise<IntegrationHeatmapItem[]> => apiClient.get('/integrations/heatmap')
};
