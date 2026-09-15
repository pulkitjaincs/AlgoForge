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
    onMutate: async (questionId: string) => {
      await queryClient.cancelQueries({ queryKey: ['topics'] });
      const previousTopics = queryClient.getQueryData(['topics']);
      
      queryClient.setQueryData(['topics'], (old: any) => {
        if (!old) return old;
        return old.map((topic: any) => ({
          ...topic,
          questions: topic.questions.map((q: any) => 
            q.id === questionId ? { ...q, isSolved: !q.isSolved } : q
          ),
          subTopics: topic.subTopics.map((st: any) => ({
            ...st,
            questions: st.questions.map((q: any) => 
              q.id === questionId ? { ...q, isSolved: !q.isSolved } : q
            )
          }))
        }));
      });
      
      return { previousTopics };
    },
    onError: (_err, _variables, context) => {
      if (context?.previousTopics) {
        queryClient.setQueryData(['topics'], context.previousTopics);
      }
    },
    onSettled: () => {
      // Silent background refetch
      queryClient.invalidateQueries({ queryKey: ['topics'] });
      queryClient.invalidateQueries({ queryKey: ['analytics'] });
    },
  });
};

export const useToggleStarred = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (questionId: string) => questionsApi.toggleStarred(questionId),
    onMutate: async (questionId: string) => {
      await queryClient.cancelQueries({ queryKey: ['topics'] });
      const previousTopics = queryClient.getQueryData(['topics']);
      
      queryClient.setQueryData(['topics'], (old: any) => {
        if (!old) return old;
        return old.map((topic: any) => ({
          ...topic,
          questions: topic.questions.map((q: any) => 
            q.id === questionId ? { ...q, isStarred: !q.isStarred } : q
          ),
          subTopics: topic.subTopics.map((st: any) => ({
            ...st,
            questions: st.questions.map((q: any) => 
              q.id === questionId ? { ...q, isStarred: !q.isStarred } : q
            )
          }))
        }));
      });
      
      return { previousTopics };
    },
    onError: (_err, _variables, context) => {
      if (context?.previousTopics) {
        queryClient.setQueryData(['topics'], context.previousTopics);
      }
    },
    onSettled: () => {
      // Silent background refetch
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

export const useReorderQuestions = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ topicId, subTopicId, data }: { topicId: string; subTopicId: string | null; data: { questionIds: string[] } }) => 
      questionsApi.reorder(topicId, subTopicId, data.questionIds),
    onMutate: async ({ topicId, subTopicId, data }) => {
      await queryClient.cancelQueries({ queryKey: ['topics'] });
      const previousTopics = queryClient.getQueryData(['topics']);
      
      queryClient.setQueryData(['topics'], (old: any) => {
        if (!old) return old;
        return old.map((topic: any) => {
          if (topic.id === topicId) {
            if (!subTopicId) {
              const newQs = [...topic.questions].sort((a: any, b: any) => 
                data.questionIds.indexOf(a.id) - data.questionIds.indexOf(b.id)
              );
              return { ...topic, questions: newQs };
            } else {
              return {
                ...topic,
                subTopics: topic.subTopics.map((st: any) => {
                  if (st.id === subTopicId) {
                    const newQs = [...st.questions].sort((a: any, b: any) => 
                      data.questionIds.indexOf(a.id) - data.questionIds.indexOf(b.id)
                    );
                    return { ...st, questions: newQs };
                  }
                  return st;
                })
              };
            }
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
