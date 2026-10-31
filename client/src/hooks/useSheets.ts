import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { sheetsApi } from '../api/sheets';
import { SheetAgentPlanInput, SheetAgentApplyInput } from '@algoforge/shared';
import { toast } from 'sonner';

export const usePublicSheets = () => {
  return useQuery({
    queryKey: ['sheets', 'public'],
    queryFn: () => sheetsApi.getPublicSheets().then(res => res.data || res)
  });
};

export const useMySheets = () => {
  return useQuery({
    queryKey: ['sheets', 'my'],
    queryFn: () => sheetsApi.getMySheets().then(res => res.data || res)
  });
};

export const useSheetDetails = (sheetId?: string) => {
  return useQuery({
    queryKey: ['sheets', sheetId],
    queryFn: () => (sheetId ? sheetsApi.getSheetById(sheetId).then(res => res.data || res) : null),
    enabled: !!sheetId,
  });
};

export const usePublishSheet = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: sheetsApi.publishSheet,
    onSuccess: () => {
      toast.success('Sheet published to community!');
      queryClient.invalidateQueries({ queryKey: ['sheets', 'public'] });
      queryClient.invalidateQueries({ queryKey: ['sheets', 'my'] });
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || err.message || 'Failed to publish sheet');
    }
  });
};

export const useCloneSheet = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: sheetsApi.cloneSheet,
    onSuccess: (data: any) => {
      toast.success(data?.message || 'Sheet cloned to your workspace!');
      queryClient.invalidateQueries({ queryKey: ['sheets', 'public'] });
      queryClient.invalidateQueries({ queryKey: ['topics'] });
      queryClient.invalidateQueries({ queryKey: ['analytics'] });
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || err.message || 'Failed to clone sheet');
    }
  });
};

export const useDeleteSheet = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (sheetId: string) => sheetsApi.deleteSheet(sheetId),
    onSuccess: () => {
      toast.success('Sheet deleted successfully');
      queryClient.invalidateQueries({ queryKey: ['sheets', 'public'] });
      queryClient.invalidateQueries({ queryKey: ['sheets', 'my'] });
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || err.message || 'Failed to delete sheet');
    }
  });
};

export const useSheetAgentPlan = () => {
  return useMutation({
    mutationFn: (data: SheetAgentPlanInput) => sheetsApi.planSheetAction(data),
    onError: (err: any) => {
      toast.error(err.response?.data?.message || err.message || 'AI Copilot failed to plan changes');
    }
  });
};

export const useSheetAgentApply = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: SheetAgentApplyInput) => sheetsApi.applySheetAction(data),
    onSuccess: (res: any) => {
      toast.success(res?.message || 'Sheet changes applied successfully!');
      queryClient.invalidateQueries({ queryKey: ['topics'] });
      queryClient.invalidateQueries({ queryKey: ['sheets', 'public'] });
      queryClient.invalidateQueries({ queryKey: ['sheets', 'my'] });
      queryClient.invalidateQueries({ queryKey: ['analytics'] });
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || err.message || 'Failed to apply sheet changes');
    }
  });
};
