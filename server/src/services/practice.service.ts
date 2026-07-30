import { prisma } from '../config/database.js';
import { getReviewQueue } from './review.service.js';
import { getWeakAreas } from './analytics.service.js';

export const getDailyPlan = async (userId: string) => {
  // 1. Get 2-3 from review queue
  const reviewQueue = await getReviewQueue(userId);
  const reviewQuestions = reviewQueue.slice(0, 3);
  
  // 2. Get 2-3 unsolved from weak areas
  const weakAreas = await getWeakAreas(userId);
  let weakAreaQuestions: any[] = [];
  if (weakAreas.length > 0) {
    const weakTopicIds = weakAreas.map(w => w.topicId);
    const weakQuestions = await prisma.question.findMany({
      where: {
        AND: [
          { OR: [{ topic: { userId } }, { subTopic: { topic: { userId } } }] },
          { deletedAt: null },
          { isSolved: false },
          { OR: [{ topicId: { in: weakTopicIds } }, { subTopic: { topicId: { in: weakTopicIds } } }] }
        ]
      },
      take: 3,
      include: { topic: true, subTopic: { include: { topic: true } } }
    });
    weakAreaQuestions = weakQuestions;
  }
  
  // 3. Get 1-2 random unsolved
  const existingIds = [...reviewQuestions.map(q => q.id), ...weakAreaQuestions.map(q => q.id)];
  const randomUnsolved = await prisma.question.findMany({
    where: {
      AND: [
        { OR: [{ topic: { userId } }, { subTopic: { topic: { userId } } }] },
        { deletedAt: null },
        { isSolved: false },
        { id: { notIn: existingIds } }
      ]
    },
    take: 2,
    include: { topic: true, subTopic: { include: { topic: true } } }
  });

  return {
    review: reviewQuestions,
    weak: weakAreaQuestions,
    random: randomUnsolved
  };
};
