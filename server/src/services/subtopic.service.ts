import { prisma } from '../config/database.js';
import { AppError } from '../utils/AppError.js';
import { cache } from '../utils/cache.js';
import { CreateSubTopicInput, UpdateSubTopicInput } from '../schemas/subtopic.schema.js';

export const createSubTopic = async (userId: string, topicId: string, data: CreateSubTopicInput) => {
  const topic = await prisma.topic.findFirst({ where: { id: topicId, userId, deletedAt: null } });
  if (!topic) throw new AppError('Topic not found', 404);

  const count = await prisma.subTopic.count({ where: { topicId } });
  
  const subTopic = await prisma.subTopic.create({
    data: {
      ...data,
      order: count,
      topicId,
    },
  });
  await cache.invalidateTag(`user:${userId}`);
  return subTopic;
};

export const updateSubTopic = async (userId: string, subTopicId: string, data: UpdateSubTopicInput) => {
  const subTopic = await prisma.subTopic.findFirst({
    where: { id: subTopicId, deletedAt: null },
    include: { topic: true },
  });

  if (!subTopic) throw new AppError('Sub-topic not found', 404);
  if (subTopic.topic.userId !== userId || subTopic.topic.deletedAt !== null) throw new AppError('Unauthorized or topic deleted', 403);

  const updated = await prisma.subTopic.update({
    where: { id: subTopicId },
    data,
  });
  await cache.invalidateTag(`user:${userId}`);
  return updated;
};

export const deleteSubTopic = async (userId: string, subTopicId: string) => {
  const subTopic = await prisma.subTopic.findFirst({
    where: { id: subTopicId, deletedAt: null },
    include: { topic: true },
  });

  if (!subTopic) throw new AppError('Sub-topic not found', 404);
  if (subTopic.topic.userId !== userId || subTopic.topic.deletedAt !== null) throw new AppError('Unauthorized or topic deleted', 403);

  await prisma.subTopic.update({ 
    where: { id: subTopicId },
    data: { deletedAt: new Date() }
  });
  await cache.invalidateTag(`user:${userId}`);
};

export const reorderSubTopics = async (userId: string, topicId: string, orderedIds: string[]) => {
  const topic = await prisma.topic.findFirst({ where: { id: topicId, userId, deletedAt: null } });
  if (!topic) throw new AppError('Topic not found', 404);

  const updates = orderedIds.map((id, index) =>
    prisma.subTopic.updateMany({
      where: { id, topicId, deletedAt: null },
      data: { order: index },
    })
  );
  await prisma.$transaction(updates);
  await cache.invalidateTag(`user:${userId}`);
};

