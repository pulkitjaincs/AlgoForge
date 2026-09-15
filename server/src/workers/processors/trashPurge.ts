import { Job } from 'bullmq';
import { logger } from '../../utils/logger.js';
import { prisma } from '../../config/database.js';

export const processTrashPurge = async (job: Job) => {
  logger.info('Starting scheduled trash purge...');
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const [deletedQuestions, deletedSubTopics, deletedTopics] = await prisma.$transaction([
    prisma.question.deleteMany({
      where: { deletedAt: { lt: thirtyDaysAgo } }
    }),
    prisma.subTopic.deleteMany({
      where: { deletedAt: { lt: thirtyDaysAgo } }
    }),
    prisma.topic.deleteMany({
      where: { deletedAt: { lt: thirtyDaysAgo } }
    })
  ]);

  logger.info(`Trash purge complete. Deleted ${deletedQuestions.count} questions, ${deletedSubTopics.count} subtopics, ${deletedTopics.count} topics.`);
  return { questions: deletedQuestions.count, subTopics: deletedSubTopics.count, topics: deletedTopics.count };
};
