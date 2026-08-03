import { apiClient } from './client';
import { Question } from '@algoforge/shared';

export const questionsApi = {
  create: (topicId: string, subTopicId: string | null, data: Partial<Question>): Promise<Question> => {
    const url = subTopicId
      ? `/topics/${topicId}/subtopics/${subTopicId}/questions`
      : `/topics/${topicId}/questions`;
    return apiClient.post(url, data);
  },
  update: (questionId: string, data: Partial<Question>): Promise<Question> => {
    return apiClient.put(`/questions/${questionId}`, data);
  },
  delete: (topicId: string, subTopicId: string | null, questionId: string): Promise<void> => {
    const url = subTopicId
      ? `/topics/${topicId}/subtopics/${subTopicId}/questions/${questionId}`
      : `/topics/${topicId}/questions/${questionId}`;
    return apiClient.delete(url);
  },
  toggleSolved: (questionId: string): Promise<void> => apiClient.patch(`/questions/${questionId}/toggle`),
  toggleStarred: (questionId: string): Promise<void> => apiClient.patch(`/questions/${questionId}/star`),
  updateNotes: (questionId: string, notes: string): Promise<void> => apiClient.patch(`/questions/${questionId}/notes`, { notes }),
  addAttempt: (questionId: string, duration?: number, confidence?: number): Promise<Question> => {
    return apiClient.post(`/questions/${questionId}/attempts`, { duration, confidence });
  },
  reorder: (topicId: string, subTopicId: string | null, questionIds: string[]): Promise<void> => {
    const url = subTopicId
      ? `/topics/${topicId}/subtopics/${subTopicId}/questions/reorder`
      : `/topics/${topicId}/questions/reorder`;
    return apiClient.put(url, { questionIds });
  },
  
  // System actions related to questions
  resetProgress: (): Promise<void> => apiClient.patch('/system/reset-progress'),
  fullReset: (): Promise<void> => apiClient.post('/system/full-reset'),
};
