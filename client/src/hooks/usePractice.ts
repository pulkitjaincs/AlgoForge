import { useQuery } from '@tanstack/react-query';
import { practiceApi } from '../api/practice';

export const useDailyPlan = () => {
  return useQuery({
    queryKey: ['practice', 'daily'],
    queryFn: practiceApi.getDailyPlan,
  });
};
