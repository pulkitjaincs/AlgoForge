import { apiClient } from './client';

export const analyticsApi = {
  getSummary: (): Promise<any> => apiClient.get('/analytics/summary'),
  getHeatmap: (year: number): Promise<any> => apiClient.get(`/analytics/heatmap?year=${year}`),
  getStreaks: (): Promise<any> => apiClient.get('/analytics/streaks'),
  getTopicMastery: (): Promise<any> => apiClient.get('/analytics/topic-mastery'),
  getWeakAreas: (): Promise<any> => apiClient.get('/analytics/weak-areas'),
  getVelocity: (period: string = 'weekly'): Promise<any> => apiClient.get(`/analytics/velocity?period=${period}`),
};
