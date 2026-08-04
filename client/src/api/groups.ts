import { apiClient } from './client';

export const groupsApi = {
  getMyGroups: (): Promise<any> => apiClient.get('/groups'),
  createGroup: (data: { name: string }): Promise<any> => apiClient.post('/groups', data),
  joinGroup: (data: { inviteCode: string }): Promise<any> => apiClient.post('/groups/join', data),
  getGroup: (id: string): Promise<any> => apiClient.get(`/groups/${id}`)
};
