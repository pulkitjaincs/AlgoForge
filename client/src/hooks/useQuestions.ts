import { useMutation, useQueryClient } from '@tanstack/react-query';
import { questionsApi } from '../api/questions';
import { toast } from 'sonner';
import { Question } from '@algoforge/shared';

export const useCreateQuestion = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ topicId, subTopicId, data }: { topicId: string; subTopicId: string | null; data: Partial<Question> }) => 
      questionsApi.create(topicId, subTopicId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['topics'] });
      toast.success('Question added');
    },
  });
};

export const useUpdateQuestion = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ questionId, data }: { questionId: string; data: Partial<Question> }) => 
      questionsApi.update(questionId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['topics'] });
      toast.success('Question updated');
    },
  });
};

export const useDeleteQuestion = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ topicId, subTopicId, questionId }: { topicId: string; subTopicId: string | null; questionId: string }) => 
      questionsApi.delete(topicId, subTopicId, questionId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['topics'] });
      toast.success('Question deleted');
    },
  });
};

export const useToggleSolved = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (questionId: string) => questionsApi.toggleSolved(questionId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['topics'] });
    },
  });
};

export const useToggleStarred = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (questionId: string) => questionsApi.toggleStarred(questionId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['topics'] });
    },
  });
};

export const useUpdateNotes = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ questionId, notes }: { questionId: string; notes: string }) => questionsApi.updateNotes(questionId, notes),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['topics'] });
      toast.success('Notes updated');
    },
  });
};

export const useResetProgress = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: questionsApi.resetProgress,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['topics'] });
      toast.success('Progress reset');
    },
  });
};

export const useFullReset = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: questionsApi.fullReset,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['topics'] });
      toast.success('All data reset');
    },
  });
};

export const useReorderQuestions = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ topicId, subTopicId, data }: { topicId: string; subTopicId: string | null; data: { questionIds: string[] } }) => 
      questionsApi.reorder(topicId, subTopicId, data.questionIds),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['topics'] });
    },
  });
};
