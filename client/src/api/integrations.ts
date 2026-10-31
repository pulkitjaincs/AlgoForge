import { apiClient } from './client';

export interface Integration {
  id: string;
  userId: string;
  platform: 'leetcode' | 'codeforces' | 'codechef' | 'gfg' | 'atcoder' | 'github';
  username: string;
  solvedCount: number;
  rating: number;
  maxRating: number;
  contributions: number;
  tier?: string;
  lastSyncedAt: string;
}

export interface IntegrationHeatmapItem {
  date: string;
  count: number;
  platforms?: Record<string, number>;
}

export interface SyncProgressEvent {
  type: 'progress' | 'complete' | 'error';
  platform?: string;
  percent?: number;
  message?: string;
  integrations?: Integration[];
  heatmap?: IntegrationHeatmapItem[];
}

export const integrationsApi = {
  getIntegrations: (): Promise<Integration[]> => apiClient.get('/integrations'),
  linkIntegration: (platform: Integration['platform'], username: string, accessToken?: string): Promise<Integration> => apiClient.post('/integrations', { platform, username, accessToken }),
  unlinkIntegration: (platform: Integration['platform']) => apiClient.delete(`/integrations/${platform}`),
  syncIntegrations: (): Promise<any> => apiClient.post('/integrations/sync'),
  getIntegrationHeatmap: (): Promise<IntegrationHeatmapItem[]> => apiClient.get('/integrations/heatmap'),
  streamSync: async (
    onProgress: (event: SyncProgressEvent) => void
  ): Promise<{ integrations: Integration[]; heatmap: IntegrationHeatmapItem[] }> => {
    const response = await fetch('/api/v1/integrations/sync/stream', {
      credentials: 'include',
      headers: {
        Accept: 'text/event-stream',
      },
    });

    if (!response.ok) {
      let errMessage = 'Failed to start sync stream';
      try {
        const errJson = await response.json();
        errMessage = errJson.message || errJson.error || errMessage;
      } catch {
        // use default
      }
      throw new Error(errMessage);
    }

    const reader = response.body?.getReader();
    if (!reader) throw new Error('Response body is not readable');

    const decoder = new TextDecoder();
    let buffer = '';
    let result: any = null;

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const chunks = buffer.split('\n\n');
      buffer = chunks.pop() || '';

      for (const chunk of chunks) {
        const line = chunk.trim();
        if (line.startsWith('data:')) {
          try {
            const parsed: SyncProgressEvent = JSON.parse(line.slice(5).trim());
            onProgress(parsed);
            if (parsed.type === 'complete') {
              result = parsed;
            } else if (parsed.type === 'error') {
              throw new Error(parsed.message || 'Platform sync failed');
            }
          } catch (e: any) {
            if (e.message && !e.message.includes('JSON')) {
              throw e;
            }
          }
        }
      }
    }

    if (result) {
      return { integrations: result.integrations, heatmap: result.heatmap };
    }

    const data = await integrationsApi.getIntegrations();
    const heatmap = await integrationsApi.getIntegrationHeatmap();
    return { integrations: data, heatmap };
  },
};
