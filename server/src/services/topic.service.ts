import { prisma } from '../config/database.js';
import { AppError } from '../utils/AppError.js';
import { cache } from '../utils/cache.js';

export const getAllTopics = async (userId: string) => {
  const cacheKey = `topics:${userId}`;
  
  const cached = await cache.get(cacheKey);
  if (cached) return cached;

  const topics = await prisma.topic.findMany({
    where: { userId },
    orderBy: { order: 'asc' },
    include: {
      subTopics: {
        orderBy: { order: 'asc' },
        include: {
          questions: { orderBy: { order: 'asc' } },
        },
      },
      questions: { orderBy: { order: 'asc' } },
    },
  });

  await cache.setWithTag(cacheKey, `user:${userId}`, topics, 300);
  return topics;
};

export const createTopic = async (userId: string, data: any) => {
  const count = await prisma.topic.count({ where: { userId } });
  const topic = await prisma.topic.create({
    data: {
      ...data,
      order: count,
      userId,
    },
  });
  await cache.invalidateTag(`user:${userId}`);
  return topic;
};

export const updateTopic = async (topicId: string, userId: string, data: any) => {
  const topic = await prisma.topic.findFirst({ where: { id: topicId, userId } });
  if (!topic) throw new AppError('Topic not found', 404);

  const updated = await prisma.topic.update({
    where: { id: topicId },
    data,
  });
  await cache.invalidateTag(`user:${userId}`);
  return updated;
};

export const deleteTopic = async (topicId: string, userId: string) => {
  const topic = await prisma.topic.findFirst({ where: { id: topicId, userId } });
  if (!topic) throw new AppError('Topic not found', 404);

  await prisma.topic.delete({ where: { id: topicId } });
  await cache.invalidateTag(`user:${userId}`);
};

export const reorderTopics = async (userId: string, orderedIds: string[]) => {
  const updates = orderedIds.map((id, index) =>
    prisma.topic.updateMany({
      where: { id, userId },
      data: { order: index },
    })
  );
  await prisma.$transaction(updates);
  await cache.invalidateTag(`user:${userId}`);
};

