import { apiClient } from './client';

export const authApi = {
  login: (data: any): Promise<any> => apiClient.post('/auth/login', data),
  register: (data: any): Promise<any> => apiClient.post('/auth/register', data),
  logout: (): Promise<any> => apiClient.post('/auth/logout'),
  getMe: (): Promise<any> => apiClient.get('/auth/me'),
};
