import { apiClient } from './client';
import { SheetAgentPlanInput, SheetActionDiff, SheetAgentApplyInput } from '@algoforge/shared';

export const sheetsApi = {
  getPublicSheets: (): Promise<any> => apiClient.get('/sheets'),
  getSheetById: (id: string): Promise<any> => apiClient.get(`/sheets/${id}`),
  publishSheet: (data: any): Promise<any> => apiClient.post('/sheets/publish', data),
  cloneSheet: (id: string): Promise<any> => apiClient.post(`/sheets/${id}/clone`),
  deleteSheet: (id: string): Promise<any> => apiClient.delete(`/sheets/${id}`),
  getMySheets: (): Promise<any> => apiClient.get('/sheets/my-sheets'),
  planSheetAction: (data: SheetAgentPlanInput): Promise<SheetActionDiff> => apiClient.post('/sheets/agent/plan', data),
  applySheetAction: (data: SheetAgentApplyInput): Promise<any> => apiClient.post('/sheets/agent/apply', data),
};
