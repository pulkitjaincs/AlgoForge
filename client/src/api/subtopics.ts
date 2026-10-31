import { apiClient } from './client';
import { SubTopic } from '@algoforge/shared';

export const subtopicsApi = {
  create: (topicId: string, data: { title: string }): Promise<SubTopic> => apiClient.post(`/topics/${topicId}/subtopics`, data),
  update: (subTopicId: string, data: { title: string }): Promise<SubTopic> => apiClient.put(`/subtopics/${subTopicId}`, data),
  delete: (_topicId: string, subTopicId: string): Promise<void> => apiClient.delete(`/subtopics/${subTopicId}`),
  reorder: (topicId: string, data: { orderedIds: string[] }): Promise<void> => apiClient.put(`/topics/${topicId}/subtopics/reorder`, data),
};
