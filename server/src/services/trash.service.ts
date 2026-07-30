import { prisma } from '../config/database.js';
import { AppError } from '../utils/AppError.js';
import { cache } from '../utils/cache.js';

export const getTrashItems = async (userId: string) => {
  const topics = await prisma.topic.findMany({
    where: { userId, deletedAt: { not: null } },
  });

  // To find subtopics or questions, we might have to filter by their owner if we want users to only see their own items.
  // We can do this efficiently by filtering on the relations.
  const subTopics = await prisma.subTopic.findMany({
    where: { topic: { userId }, deletedAt: { not: null } },
  });

  const questions = await prisma.question.findMany({
    where: {
      OR: [
        { topic: { userId } },
        { subTopic: { topic: { userId } } }
      ],
      deletedAt: { not: null }
    },
  });

  return { topics, subTopics, questions };
};

export const restoreItem = async (userId: string, id: string, type: 'topic' | 'subtopic' | 'question') => {
  let updated;
  
  if (type === 'topic') {
    const topic = await prisma.topic.findFirst({ where: { id, userId, deletedAt: { not: null } } });
    if (!topic) throw new AppError('Topic not found in trash', 404);
    updated = await prisma.topic.update({ where: { id }, data: { deletedAt: null } });
  } else if (type === 'subtopic') {
    const subTopic = await prisma.subTopic.findFirst({ where: { id, topic: { userId }, deletedAt: { not: null } } });
    if (!subTopic) throw new AppError('Sub-topic not found in trash', 404);
    updated = await prisma.subTopic.update({ where: { id }, data: { deletedAt: null } });
  } else {
    const question = await prisma.question.findFirst({
      where: {
        id,
        OR: [
          { topic: { userId } },
          { subTopic: { topic: { userId } } }
        ],
        deletedAt: { not: null }
      }
    });
    if (!question) throw new AppError('Question not found in trash', 404);
    updated = await prisma.question.update({ where: { id }, data: { deletedAt: null } });
  }

  await cache.invalidateTag(`user:${userId}`);
  return updated;
};

export const permanentlyDeleteItem = async (userId: string, id: string, type: 'topic' | 'subtopic' | 'question') => {
  if (type === 'topic') {
    const topic = await prisma.topic.findFirst({ where: { id, userId, deletedAt: { not: null } } });
    if (!topic) throw new AppError('Topic not found in trash', 404);
    await prisma.topic.delete({ where: { id } });
  } else if (type === 'subtopic') {
    const subTopic = await prisma.subTopic.findFirst({ where: { id, topic: { userId }, deletedAt: { not: null } } });
    if (!subTopic) throw new AppError('Sub-topic not found in trash', 404);
    await prisma.subTopic.delete({ where: { id } });
  } else {
    const question = await prisma.question.findFirst({
      where: {
        id,
        OR: [
          { topic: { userId } },
          { subTopic: { topic: { userId } } }
        ],
        deletedAt: { not: null }
      }
    });
    if (!question) throw new AppError('Question not found in trash', 404);
    await prisma.question.delete({ where: { id } });
  }

  await cache.invalidateTag(`user:${userId}`);
};
