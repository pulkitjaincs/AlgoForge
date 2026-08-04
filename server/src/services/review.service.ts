import { questionRepository } from '../repositories/question.repository.js';
import { cache } from '../utils/cache.js';

export const getReviewQueue = async (userId: string) => {
  const cacheKey = `review_queue:${userId}`;
  const cached = await cache.get(cacheKey);
  if (cached) return cached;

  const now = new Date();
  const queue = await questionRepository.findReviewQueue(userId, now);
  
  await cache.setWithTag(cacheKey, `user:${userId}`, queue, 300); // 5 mins cache
  return queue;
};

export const getReviewStats = async (userId: string) => {
  const cacheKey = `review_stats:${userId}`;
  const cached = await cache.get(cacheKey);
  if (cached) return cached;

  const now = new Date();
  const endOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59);
  
  const dueTodayCount = await questionRepository.countReviewQueue(userId, endOfDay);
  const overdueCount = await questionRepository.countReviewQueue(userId, now);

  const stats = { dueToday: dueTodayCount, overdue: overdueCount };
  await cache.setWithTag(cacheKey, `user:${userId}`, stats, 300); // 5 mins cache

  return stats;
};
