import { apiClient } from './client';
import { Topic } from '@algoforge/shared';

export const topicsApi = {
  getAll: (queryStr: string = ''): Promise<Topic[]> => apiClient.get(`/topics${queryStr ? `?${queryStr}` : ''}`),
  create: (data: { title: string; description?: string }): Promise<Topic> => apiClient.post('/topics', data),
  update: (id: string, data: { title: string; description?: string }): Promise<Topic> => apiClient.put(`/topics/${id}`, data),
  delete: (id: string): Promise<void> => apiClient.delete(`/topics/${id}`),
  reorder: (data: { topicIds: string[] }): Promise<void> => apiClient.post('/topics/reorder', data),
};
