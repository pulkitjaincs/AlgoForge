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
    mutationFn: ({ topicId, data }: { topicId: string; data: { subTopicIds: string[] } }) => subtopicsApi.reorder(topicId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['topics'] });
    },
  });
};
