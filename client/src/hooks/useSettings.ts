import { useMutation, useQueryClient } from '@tanstack/react-query';
import { usersApi } from '../api/users';
import { UpdateEmailInput, UpdatePasswordInput } from '@algoforge/shared';

export const useUpdateEmail = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: UpdateEmailInput) => usersApi.updateEmail(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['auth', 'me'] });
    },
  });
};

export const useUpdatePassword = () => {
  return useMutation({
    mutationFn: (data: UpdatePasswordInput) => usersApi.updatePassword(data),
  });
};
