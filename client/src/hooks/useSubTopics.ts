import { useMutation, useQueryClient } from '@tanstack/react-query';
import { subtopicsApi } from '../api/subtopics';
import { toast } from 'sonner';

export const useCreateSubTopic = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ topicId, data }: { topicId: string; data: { title: string } }) => subtopicsApi.create(topicId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['topics'] });
      toast.success('Sub-topic created');
    },
  });
};

export const useUpdateSubTopic = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ subTopicId, data }: { subTopicId: string; data: { title: string } }) => subtopicsApi.update(subTopicId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['topics'] });
      toast.success('Sub-topic updated');
    },
  });
};

export const useDeleteSubTopic = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ topicId, subTopicId }: { topicId: string; subTopicId: string }) => subtopicsApi.delete(topicId, subTopicId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['topics'] });
      toast.success('Sub-topic deleted');
    },
  });
};

export const useReorderSubTopics = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ topicId, data }: { topicId: string; data: { orderedIds: string[] } }) => subtopicsApi.reorder(topicId, data),
    onMutate: async ({ topicId, data }) => {
      await queryClient.cancelQueries({ queryKey: ['topics'] });
      const previousTopics = queryClient.getQueryData(['topics']);
      
      queryClient.setQueryData(['topics'], (old: any) => {
        if (!old) return old;
        return old.map((topic: any) => {
          if (topic.id === topicId) {
            const newSubTopics = [...topic.subTopics].sort((a: any, b: any) => 
              data.orderedIds.indexOf(a.id) - data.orderedIds.indexOf(b.id)
            );
            return { ...topic, subTopics: newSubTopics };
          }
          return topic;
        });
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
