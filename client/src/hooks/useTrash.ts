import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { trashApi } from '../api/trash';

export const useTrash = () => {
  return useQuery({
    queryKey: ['trash'],
    queryFn: trashApi.getTrash
  });
};

export const useRestoreTrash = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, type }: { id: string; type: string }) => trashApi.restore(id, type),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['trash'] });
      queryClient.invalidateQueries({ queryKey: ['topics'] });
    }
  });
};

export const useDeleteTrash = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, type }: { id: string; type: string }) => trashApi.permanentDelete(id, type),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['trash'] })
  });
};
