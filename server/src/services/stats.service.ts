import { prisma } from '../config/database.js';

export const getGlobalProgressStats = async (userId: string) => {
  const [totalQuestions, solvedQuestions] = await Promise.all([
    prisma.question.count({
      where: { 
        deletedAt: null,
        OR: [
          { topic: { userId } },
          { subTopic: { topic: { userId } } }
        ]
      }
    }),
    prisma.question.count({
      where: { 
        deletedAt: null,
        isSolved: true,
        OR: [
          { topic: { userId } },
          { subTopic: { topic: { userId } } }
        ]
      }
    })
  ]);

  return {
    total: totalQuestions,
    solved: solvedQuestions,
    progress: totalQuestions > 0 ? Math.round((solvedQuestions / totalQuestions) * 100) : 0
  };
};
