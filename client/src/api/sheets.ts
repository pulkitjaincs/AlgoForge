import { PublishSheetInput } from '@algoforge/shared';
import { apiClient } from './client';

export const sheetsApi = {
  getPublicSheets: () => apiClient.get('/sheets'),
  getSheetById: (id: string) => apiClient.get(`/sheets/${id}`),
  publishSheet: (data: PublishSheetInput) => apiClient.post('/sheets/publish', data),
};
