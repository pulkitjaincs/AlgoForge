import { topicRepository } from '../repositories/topic.repository.js';
import { attemptRepository } from '../repositories/attempt.repository.js';
import { analyticsRepository } from '../repositories/analytics.repository.js';
import { cache } from '../utils/cache.js';

export interface AnalyticsSummary {
  totalQuestions: number;
  solvedQuestions: number;
  difficultyStats: { Easy: number; Medium: number; Hard: number; Basic: number };
  solvedByDifficulty: { Easy: number; Medium: number; Hard: number; Basic: number };
}

export interface HeatmapEntry {
  date: string;
  count: number;
}

export interface StreaksSummary {
  currentStreak: number;
  maxStreak: number;
  lastActive: Date | null;
}

export interface TopicMastery {
  topicId: string;
  title: string;
  total: number;
  solved: number;
  percentage: number;
}

export interface VelocityEntry {
  period: string;
  count: number;
}
export const getSummary = async (userId: string): Promise<AnalyticsSummary> => {
  const cacheKey = `analytics_summary:${userId}`;
  const cached = await cache.get<AnalyticsSummary>(cacheKey);
  if (cached) return cached;

  const stats = await analyticsRepository.getSummaryStats(userId);

  let totalQuestions = 0;
  let solvedQuestions = 0;
  const difficultyStats = { Easy: 0, Medium: 0, Hard: 0, Basic: 0 };
  const solvedByDifficulty = { Easy: 0, Medium: 0, Hard: 0, Basic: 0 };

  for (const stat of stats) {
    totalQuestions += stat.total;
    solvedQuestions += stat.solved;
    const diff = stat.difficulty;
    if (diff in difficultyStats) {
      difficultyStats[diff as keyof typeof difficultyStats] = stat.total;
      solvedByDifficulty[diff as keyof typeof solvedByDifficulty] = stat.solved;
    }
  }

  const result = { totalQuestions, solvedQuestions, difficultyStats, solvedByDifficulty };
  await cache.setWithTag(cacheKey, `user:${userId}`, result, 300);
  return result;
};

export const getHeatmap = async (userId: string, year?: number): Promise<HeatmapEntry[]> => {
  const cacheKey = `analytics_heatmap:${userId}:${year || 'all'}`;
  const cached = await cache.get<HeatmapEntry[]>(cacheKey);
  if (cached) return cached;

  let attempts;
  if (year) {
    const startDate = new Date(year, 0, 1);
    const endDate = new Date(year, 11, 31, 23, 59, 59);
    attempts = await attemptRepository.findAttempts(userId, { startDate, endDate });
  } else {
    attempts = await attemptRepository.findAttempts(userId);
  }

  const heatmap: Record<string, number> = {};
  for (const a of attempts) {
    const dateStr = a.solvedAt.toISOString().split('T')[0];
    heatmap[dateStr] = (heatmap[dateStr] || 0) + 1;
  }

  const result = Object.entries(heatmap).map(([date, count]) => ({ date, count }));
  await cache.setWithTag(cacheKey, `user:${userId}`, result, 300);
  return result;
};

export const getStreaks = async (userId: string): Promise<StreaksSummary> => {
  const cacheKey = `analytics_streaks:${userId}`;
  const cached = await cache.get<StreaksSummary>(cacheKey);
  if (cached) return cached;

  const rawStreaks = await analyticsRepository.getStreaks(userId);
  const result = {
    currentStreak: rawStreaks.current_streak,
    maxStreak: rawStreaks.max_streak,
    lastActive: rawStreaks.last_active
  };
  await cache.setWithTag(cacheKey, `user:${userId}`, result, 300);
  return result;
};

export const getTopicMastery = async (userId: string): Promise<TopicMastery[]> => {
  const cacheKey = `analytics_topic_mastery:${userId}`;
  const cached = await cache.get<TopicMastery[]>(cacheKey);
  if (cached) return cached;

  const result = await analyticsRepository.getTopicMastery(userId);

  await cache.setWithTag(cacheKey, `user:${userId}`, result, 300);
  return result;
};

export const getWeakAreas = async (userId: string): Promise<TopicMastery[]> => {
  const cacheKey = `analytics_weak_areas:${userId}`;
  const cached = await cache.get<TopicMastery[]>(cacheKey);
  if (cached) return cached;

  const mastery = await getTopicMastery(userId);
  type MasteryEntry = { topicId: string; title: string; total: number; solved: number; percentage: number };
  const result = (mastery as MasteryEntry[]).filter(t => t.total > 0).sort((a, b) => a.percentage - b.percentage).slice(0, 5);
  
  await cache.setWithTag(cacheKey, `user:${userId}`, result, 300);
  return result;
};

export const getVelocity = async (userId: string, period: string = 'weekly'): Promise<VelocityEntry[]> => {
  const cacheKey = `analytics_velocity:${userId}:${period}`;
  const cached = await cache.get<VelocityEntry[]>(cacheKey);
  if (cached) return cached;

  const today = new Date();
  const weeks = 8;
  const startDate = new Date(today.getTime() - weeks * 7 * 24 * 60 * 60 * 1000);
  
  const attempts = await attemptRepository.findAttempts(userId, { startDate });

  const velocityMap: Record<string, number> = {};
  for (const a of attempts) {
    const d = a.solvedAt;
    const yearWeek = `${d.getFullYear()}-W${Math.ceil((d.getDate() - d.getDay() + 1) / 7)}`;
    velocityMap[yearWeek] = (velocityMap[yearWeek] || 0) + 1;
  }
  
  const result = Object.entries(velocityMap).map(([period, count]) => ({ period, count }));
  await cache.setWithTag(cacheKey, `user:${userId}`, result, 300);
  return result;
};
