import { apiClient as api } from './client';

export const notificationsApi = {
  getAll: async () => {
    const { data } = await api.get('/notifications');
    return data;
  },
  
  markAsRead: async (notificationIds: string[]) => {
    const { data } = await api.post('/notifications/read', { notificationIds });
    return data;
  },

  markAllAsRead: async () => {
    const { data } = await api.post('/notifications/read-all');
    return data;
  }
};
