import { apiClient } from './client';

export const trashApi = {
  getTrash: (): Promise<any> => apiClient.get('/trash'),
  restore: (id: string): Promise<any> => apiClient.patch(`/trash/${id}/restore`),
  permanentDelete: (id: string): Promise<any> => apiClient.delete(`/trash/${id}`)
};
