import { apiClient } from './client';

export const trashApi = {
  getTrash: (): Promise<any> => apiClient.get('/trash'),
  restore: (id: string, type: string): Promise<any> => apiClient.patch(`/trash/${id}/restore`, { type }),
  permanentDelete: (id: string, type: string): Promise<any> => apiClient.delete(`/trash/${id}`, { data: { type } })
};
