import { apiClient } from './client';
import { AICoachPlan, SocraticHintInput, SocraticHintResponse } from '@algoforge/shared';

export const aiApi = {
  getCoachPlan: (force = false): Promise<AICoachPlan> => apiClient.get(`/ai/coach${force ? '?force=true' : ''}`),
  getHint: (data: SocraticHintInput): Promise<SocraticHintResponse> => apiClient.post('/ai/hint', data),
};
