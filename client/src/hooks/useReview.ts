import { useQuery } from '@tanstack/react-query';
import { reviewApi } from '../api/review';

export const useReviewQueue = () => {
  return useQuery({
    queryKey: ['review', 'queue'],
    queryFn: reviewApi.getQueue,
  });
};

export const useReviewStats = () => {
  return useQuery({
    queryKey: ['review', 'stats'],
    queryFn: reviewApi.getStats,
  });
};
