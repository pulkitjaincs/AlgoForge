import { apiClient } from './client';

export const practiceApi = {
  getDailyPlan: (): Promise<any> => apiClient.get('/practice/daily'),
};
