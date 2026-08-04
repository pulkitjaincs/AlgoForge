import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { sheetsApi } from '../api/sheets';

export const usePublicSheets = () => {
  return useQuery({
    queryKey: ['sheets', 'public'],
    queryFn: () => sheetsApi.getPublicSheets().then(res => res.data || res)
  });
};

export const usePublishSheet = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: sheetsApi.publishSheet,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['sheets', 'public'] })
  });
};
