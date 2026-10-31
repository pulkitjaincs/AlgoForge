import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { integrationsApi, SyncProgressEvent, Integration, IntegrationHeatmapItem } from '../api/integrations';
import { toast } from 'sonner';

export const useIntegrations = () => {
  return useQuery({
    queryKey: ['integrations'],
    queryFn: integrationsApi.getIntegrations,
  });
};

export const useLinkIntegration = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ platform, username, accessToken }: { platform: 'leetcode' | 'codeforces' | 'codechef' | 'gfg' | 'atcoder' | 'github', username: string, accessToken?: string }) =>
      integrationsApi.linkIntegration(platform, username, accessToken),
    onSuccess: (res: any) => {
      if (res?.warning) {
        toast.warning(`Account linked, but stats couldn't be fetched (${res.warning}). Use "Sync All" to retry.`);
      } else {
        toast.success('Platform linked successfully');
      }
      queryClient.invalidateQueries({ queryKey: ['integrations'] });
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.error || err.message || 'Failed to link platform');
    }
  });
};

export const useUnlinkIntegration = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (platform: 'leetcode' | 'codeforces' | 'codechef' | 'gfg' | 'atcoder' | 'github') => integrationsApi.unlinkIntegration(platform),
    onSuccess: (_, platform) => {
      toast.success(`Unlinked ${platform}`);
      queryClient.invalidateQueries({ queryKey: ['integrations'] });
    }
  });
};

export interface SyncState {
  isSyncing: boolean;
  percent: number;
  message: string;
  isComplete: boolean;
  error: string | null;
}

export const useSyncIntegrations = () => {
  const queryClient = useQueryClient();
  const [syncState, setSyncState] = useState<SyncState>({
    isSyncing: false,
    percent: 0,
    message: '',
    isComplete: false,
    error: null,
  });

  const startSync = async () => {
    setSyncState({
      isSyncing: true,
      percent: 5,
      message: 'Connecting to platform sync service...',
      isComplete: false,
      error: null,
    });

    try {
      const result = await integrationsApi.streamSync((event: SyncProgressEvent) => {
        if (event.type === 'progress') {
          setSyncState((prev) => ({
            ...prev,
            percent: event.percent ?? prev.percent,
            message: event.message ?? prev.message,
          }));
        }
      });

      if (result.integrations) {
        queryClient.setQueryData(['integrations'], result.integrations);
      }
      if (result.heatmap) {
        queryClient.setQueryData(['integration-heatmap'], result.heatmap);
      }
      queryClient.invalidateQueries({ queryKey: ['analytics'] });

      setSyncState({
        isSyncing: false,
        percent: 100,
        message: 'All platforms synchronized!',
        isComplete: true,
        error: null,
      });

      toast.success('All platforms synchronized!');

      setTimeout(() => {
        setSyncState((prev) => ({ ...prev, isComplete: false }));
      }, 3500);
    } catch (err: any) {
      setSyncState({
        isSyncing: false,
        percent: 0,
        message: '',
        isComplete: false,
        error: err.message || 'Sync failed',
      });
      toast.error(err.message || 'Platform sync failed');
    }
  };

  return {
    syncState,
    startSync,
    isPending: syncState.isSyncing,
  };
};

export const useIntegrationHeatmap = () => {
  return useQuery({
    queryKey: ['integration-heatmap'],
    queryFn: integrationsApi.getIntegrationHeatmap,
  });
};
