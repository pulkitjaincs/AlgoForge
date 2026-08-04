import { useQuery } from '@tanstack/react-query';
import { analyticsApi } from '../api/analytics';

export const useAnalyticsSummary = () => {
  return useQuery({
    queryKey: ['analytics', 'summary'],
    queryFn: analyticsApi.getSummary,
  });
};

export const useAnalyticsHeatmap = (year?: number) => {
  return useQuery({
    queryKey: ['analytics', 'heatmap', year || 'all'],
    queryFn: () => analyticsApi.getHeatmap(year),
  });
};

export const useAnalyticsStreaks = () => {
  return useQuery({
    queryKey: ['analytics', 'streaks'],
    queryFn: analyticsApi.getStreaks,
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

export const useVelocity = (period: string = 'weekly') => {
  return useQuery({
    queryKey: ['analytics', 'velocity', period],
    queryFn: () => analyticsApi.getVelocity(period),
  });
};
