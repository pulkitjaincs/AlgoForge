import { prisma } from '../config/database.js';

export const getReviewQueue = async (userId: string) => {
  const now = new Date();
  const queue = await prisma.question.findMany({
    where: {
      AND: [
        { OR: [{ topic: { userId } }, { subTopic: { topic: { userId } } }] },
        { deletedAt: null },
        { nextReviewAt: { not: null } },
        { nextReviewAt: { lte: now } }
      ]
    },
    orderBy: { nextReviewAt: 'asc' },
    include: { topic: true, subTopic: { include: { topic: true } } }
  });
  return queue;
};

export const getReviewStats = async (userId: string) => {
  const now = new Date();
  
  const dueTodayCount = await prisma.question.count({
    where: {
      AND: [
        { OR: [{ topic: { userId } }, { subTopic: { topic: { userId } } }] },
        { deletedAt: null },
        { nextReviewAt: { not: null } },
        { nextReviewAt: { lte: new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59) } }
      ]
    }
  });

  const overdueCount = await prisma.question.count({
    where: {
      AND: [
        { OR: [{ topic: { userId } }, { subTopic: { topic: { userId } } }] },
        { deletedAt: null },
        { nextReviewAt: { not: null } },
        { nextReviewAt: { lte: now } }
      ]
    }
  });

  return { dueToday: dueTodayCount, overdue: overdueCount };
};
