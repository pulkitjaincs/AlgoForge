import { useQuery } from '@tanstack/react-query';
import { usersApi } from '../api/users';

export const usePublicProfile = (username: string) => {
  return useQuery({
    queryKey: ['publicProfile', username],
    queryFn: () => usersApi.getPublicProfile(username).then(res => res.data || res),
    enabled: !!username,
    retry: false
  });
};
