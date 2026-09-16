import { apiClient } from './client';

export const sheetsApi = {
  getPublicSheets: (): Promise<any> => apiClient.get('/sheets'),
  getSheetById: (id: string): Promise<any> => apiClient.get(`/sheets/${id}`),
  publishSheet: (data: any): Promise<any> => apiClient.post('/sheets/publish', data),
  cloneSheet: (id: string): Promise<any> => apiClient.post(`/sheets/${id}/clone`)
};
