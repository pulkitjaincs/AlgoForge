import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { topicsApi } from '../api/topics';
import { toast } from 'sonner';

export const useTopics = (queryStr: string = '') => {
  return useQuery({
    queryKey: ['topics', queryStr],
    queryFn: () => topicsApi.getAll(queryStr),
  });
};

export const useCreateTopic = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: topicsApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['topics'] });
      toast.success('Topic created');
    },
  });
};

export const useUpdateTopic = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: { title: string; description?: string } }) => topicsApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['topics'] });
      toast.success('Topic updated');
    },
  });
};

export const useDeleteTopic = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: topicsApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['topics'] });
      queryClient.invalidateQueries({ queryKey: ['analytics'] });
      toast.success('Topic deleted');
    },
  });
};

export const useReorderTopics = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: topicsApi.reorder,
    onMutate: async (data: { orderedIds: string[] }) => {
      await queryClient.cancelQueries({ queryKey: ['topics'] });
      const previousTopics = queryClient.getQueryData(['topics']);
      
      queryClient.setQueryData(['topics'], (old: any) => {
        if (!old) return old;
        return [...old].sort((a: any, b: any) => 
          data.orderedIds.indexOf(a.id) - data.orderedIds.indexOf(b.id)
        );
      });
      return { previousTopics };
    },
    onError: (_err, _variables, context) => {
      if (context?.previousTopics) {
        queryClient.setQueryData(['topics'], context.previousTopics);
      }
    },
  });
};
