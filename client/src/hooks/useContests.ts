import { useQuery } from '@tanstack/react-query';
import { getContests, getUserContestRatings, Contest, UserContestRating } from '../api/contests';

export const useContests = (platform?: string, status?: string) => {
  return useQuery<Contest[]>({
    queryKey: ['contests', platform || 'all', status || 'all'],
    queryFn: () => getContests(platform, status),
    staleTime: 5 * 60 * 1000, // 5 minutes fresh
    refetchInterval: 60 * 1000, // Background poll every 60s for countdown accuracy
  });
};

export const useUserContestRatings = () => {
  return useQuery<UserContestRating[]>({
    queryKey: ['contests', 'user-ratings'],
    queryFn: getUserContestRatings,
    staleTime: 10 * 60 * 1000,
  });
};
