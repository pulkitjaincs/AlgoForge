import { apiClient } from './client';

export const groupsApi = {
  createGroup: (data: { name: string }): Promise<any> => apiClient.post('/groups', data),
  joinGroup: (data: { inviteCode: string }): Promise<any> => apiClient.post('/groups/join', data),
  getMyGroups: (): Promise<any> => apiClient.get('/groups'),
  getGroup: (id: string): Promise<any> => apiClient.get(`/groups/${id}`),
  leaveGroup: (id: string): Promise<any> => apiClient.delete(`/groups/${id}/leave`),
  getLeaderboard: (id: string): Promise<any> => apiClient.get(`/groups/${id}/leaderboard`),
};
