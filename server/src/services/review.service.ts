import { questionRepository } from '../repositories/question.repository.js';

export const getReviewQueue = async (userId: string) => {
  const now = new Date();
  const queue = await questionRepository.findReviewQueue(userId, now);
  return queue;
};

export const getReviewStats = async (userId: string) => {
  const now = new Date();
  
  const endOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59);
  const dueTodayCount = await questionRepository.countReviewQueue(userId, endOfDay);

  const overdueCount = await questionRepository.countReviewQueue(userId, now);

  return { dueToday: dueTodayCount, overdue: overdueCount };
};
