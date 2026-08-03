import { CreateGroupInput, JoinGroupInput } from '@algoforge/shared';
import { apiClient } from './client';

export const groupsApi = {
  createGroup: (data: CreateGroupInput) => apiClient.post('/groups', data),
  joinGroup: (data: JoinGroupInput) => apiClient.post('/groups/join', data),
  getGroup: (id: string) => apiClient.get(`/groups/${id}`),
};
