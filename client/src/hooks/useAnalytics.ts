import { useQuery } from '@tanstack/react-query';
import { analyticsApi } from '../api/analytics';

export const useAnalyticsSummary = (platforms?: string[]) => {
  return useQuery({
    queryKey: ['analytics', 'summary', platforms],
    queryFn: () => analyticsApi.getSummary(platforms),
  });
};

export const useAnalyticsHeatmap = (year?: number) => {
  return useQuery({
    queryKey: ['analytics', 'heatmap', year || 'all'],
    queryFn: () => analyticsApi.getHeatmap(year),
  });
};

export const useTopicMastery = () => {
  return useQuery({
    queryKey: ['analytics', 'topic-mastery'],
    queryFn: analyticsApi.getTopicMastery,
  });
};

export const useWeakAreas = () => {
  return useQuery({
    queryKey: ['analytics', 'weak-areas'],
    queryFn: analyticsApi.getWeakAreas,
  });
};

export const useVelocity = (period: string = 'weekly', platforms?: string[]) => {
  return useQuery({
    queryKey: ['analytics', 'velocity', period, platforms],
    queryFn: () => analyticsApi.getVelocity(period, platforms),
  });
};
