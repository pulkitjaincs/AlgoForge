import { apiClient } from './client';
import { SubTopic } from '../types';

export const subtopicsApi = {
  create: (topicId: string, data: { title: string }): Promise<SubTopic> => apiClient.post(`/topics/${topicId}/subtopics`, data),
  update: (subTopicId: string, data: { title: string }): Promise<SubTopic> => apiClient.put(`/subtopics/${subTopicId}`, data),
  delete: (topicId: string, subTopicId: string): Promise<void> => apiClient.delete(`/topics/${topicId}/subtopics/${subTopicId}`),
  reorder: (topicId: string, data: { subTopicIds: string[] }): Promise<void> => apiClient.post(`/topics/${topicId}/subtopics/reorder`, data),
};
