import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { aiApi } from '../api/ai';
import { SocraticHintInput, SocraticHintResponse } from '@algoforge/shared';
import { toast } from 'sonner';

export const useAICoachPlan = () => {
  return useQuery({
    queryKey: ['ai', 'coach'],
    queryFn: () => aiApi.getCoachPlan(false),
    staleTime: 60 * 60 * 1000, // 1 hour client cache
  });
};

export const useRefreshAICoachPlan = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => aiApi.getCoachPlan(true),
    onSuccess: (data) => {
      queryClient.setQueryData(['ai', 'coach'], data);
      localStorage.setItem('ai_coach_last_refresh', Date.now().toString());
      toast.success('AI Coach study plan updated');
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.error || err.response?.data?.message || err.message || 'Failed to refresh plan');
    },
  });
};

export const useSocraticHint = () => {
  return useMutation<SocraticHintResponse, Error, SocraticHintInput>({
    mutationFn: (data: SocraticHintInput) => aiApi.getHint(data),
  });
};
