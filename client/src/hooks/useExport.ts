import { useMutation } from '@tanstack/react-query';
import { apiClient } from '../api/client';
import { toast } from 'sonner';

export const useRequestExport = () => {
  return useMutation({
    mutationFn: () => apiClient.post('/export'),
    onSuccess: () => {
      toast.success("Export is being generated — you'll get a notification when it's ready");
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.error || 'Failed to start export');
    }
  });
};
