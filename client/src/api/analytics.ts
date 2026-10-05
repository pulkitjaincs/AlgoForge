import { apiClient } from './client';

export const analyticsApi = {
  getSummary: (platforms?: string[]): Promise<any> => {
    const query = platforms && platforms.length > 0 ? `?platforms=${platforms.join(',')}` : '';
    return apiClient.get(`/analytics/summary${query}`);
  },
  getHeatmap: (year?: number): Promise<any> => apiClient.get(year ? `/analytics/heatmap?year=${year}` : '/analytics/heatmap'),
  getTopicMastery: (): Promise<any> => apiClient.get('/analytics/topic-mastery'),
  getWeakAreas: (): Promise<any> => apiClient.get('/analytics/weak-areas'),
  getVelocity: (period: string = 'weekly', platforms?: string[]): Promise<any> => {
    const q = platforms && platforms.length > 0 ? `&platforms=${platforms.join(',')}` : '';
    return apiClient.get(`/analytics/velocity?period=${period}${q}`);
  },
};
