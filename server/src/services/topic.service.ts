import { prisma } from '../config/database.js';
import { AppError } from '../utils/AppError.js';
import { cache } from '../utils/cache.js';
import { CreateTopicInput, UpdateTopicInput } from '../schemas/topic.schema.js';

export interface TopicFilters {
  difficulty?: string;
  platform?: string;
  isSolved?: string;
  isStarred?: string;
  tag?: string;
}

export const getAllTopics = async (userId: string, filters: TopicFilters = {}) => {
  // Can't cache effectively with many filter combinations, so we bypass cache if filters are present
  const hasFilters = Object.keys(filters).length > 0;
  const cacheKey = `topics:${userId}`;
  
  if (!hasFilters) {
    const cached = await cache.get(cacheKey);
    if (cached) return cached;
  }

  const questionFilter: any = { deletedAt: null };
  if (filters.difficulty) questionFilter.difficulty = filters.difficulty;
  if (filters.platform) questionFilter.platform = filters.platform;
  if (filters.isSolved !== undefined) questionFilter.isSolved = filters.isSolved === 'true';
  if (filters.isStarred !== undefined) questionFilter.isStarred = filters.isStarred === 'true';
  if (filters.tag) {
    questionFilter.OR = [
      { companyTags: { has: filters.tag } },
      { tags: { some: { tag: { name: filters.tag } } } }
    ];
  }

  const topics = await prisma.topic.findMany({
    where: { userId, deletedAt: null },
    orderBy: { order: 'asc' },
    include: {
      subTopics: {
        where: { deletedAt: null },
        orderBy: { order: 'asc' },
        include: {
          questions: { 
            where: questionFilter,
            orderBy: { order: 'asc' } 
          },
        },
      },
      questions: { 
        where: questionFilter,
        orderBy: { order: 'asc' } 
      },
    },
  });

  if (!hasFilters) {
    await cache.setWithTag(cacheKey, `user:${userId}`, topics, 300);
  }
  return topics;
};

export const createTopic = async (userId: string, data: CreateTopicInput) => {
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

export const updateTopic = async (topicId: string, userId: string, data: UpdateTopicInput) => {
  const topic = await prisma.topic.findFirst({ where: { id: topicId, userId, deletedAt: null } });
  if (!topic) throw new AppError('Topic not found', 404);

  const updated = await prisma.topic.update({
    where: { id: topicId },
    data,
  });
  await cache.invalidateTag(`user:${userId}`);
  return updated;
};

export const deleteTopic = async (topicId: string, userId: string) => {
  const topic = await prisma.topic.findFirst({ where: { id: topicId, userId, deletedAt: null } });
  if (!topic) throw new AppError('Topic not found', 404);

  await prisma.topic.update({
    where: { id: topicId },
    data: { deletedAt: new Date() }
  });
  await cache.invalidateTag(`user:${userId}`);
};

export const reorderTopics = async (userId: string, orderedIds: string[]) => {
  const updates = orderedIds.map((id, index) =>
    prisma.topic.updateMany({
      where: { id, userId, deletedAt: null },
      data: { order: index },
    })
  );
  await prisma.$transaction(updates);
  await cache.invalidateTag(`user:${userId}`);
};

