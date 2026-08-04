import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { integrationsApi } from '../api/integrations';
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

export const useSyncIntegrations = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: integrationsApi.syncIntegrations,
    onSuccess: () => {
      toast.success('Synced successfully');
      queryClient.invalidateQueries({ queryKey: ['integrations'] });
      queryClient.invalidateQueries({ queryKey: ['integration-heatmap'] });
    }
  });
};

export const useIntegrationHeatmap = () => {
  return useQuery({
    queryKey: ['integration-heatmap'],
    queryFn: integrationsApi.getIntegrationHeatmap,
  });
};
