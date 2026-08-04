import { getReviewQueue } from './review.service.js';
import { getWeakAreas } from './analytics.service.js';
import { questionRepository } from '../repositories/question.repository.js';

export const getDailyPlan = async (userId: string) => {
  // 1. Get 2-3 from review queue
  const reviewQueue = await getReviewQueue(userId) as { id: string; [key: string]: unknown }[];
  const reviewQuestions = reviewQueue.slice(0, 3);
  
  // 2. Get 2-3 unsolved from weak areas
  const weakAreas = await getWeakAreas(userId);
  let weakAreaQuestions: any[] = [];
  if (weakAreas.length > 0) {
    const weakTopicIds = (weakAreas as { topicId: string }[]).map((w) => w.topicId);
    weakAreaQuestions = await questionRepository.findWeakQuestions(userId, weakTopicIds, 3);
  }
  
  // 3. Get 1-2 random unsolved
  const existingIds = [...reviewQuestions.map((q) => q.id as string), ...weakAreaQuestions.map((q: { id: string }) => q.id)];
  const randomUnsolved = await questionRepository.findRandomUnsolved(userId, existingIds, 2);

  return {
    review: reviewQuestions,
    weak: weakAreaQuestions,
    random: randomUnsolved
  };
};
