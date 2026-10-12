import { useQuery } from '@tanstack/react-query';
import { usersApi, PublicProfile } from '../api/users';

export const usePublicProfile = (username: string) => {
  return useQuery<PublicProfile>({
    queryKey: ['publicProfile', username],
    queryFn: async () => {
      const res: any = await usersApi.getPublicProfile(username);
      return (res?.data?.data || res?.data || res) as PublicProfile;
    },
    enabled: !!username,
    retry: false
  });
};
