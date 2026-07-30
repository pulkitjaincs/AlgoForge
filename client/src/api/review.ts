import { apiClient } from './client';

export const reviewApi = {
  getQueue: (): Promise<any> => apiClient.get('/review/queue'),
  getStats: (): Promise<any> => apiClient.get('/review/stats'),
};
