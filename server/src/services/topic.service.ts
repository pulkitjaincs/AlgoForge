import { AppError } from '../utils/AppError.js';
import { cache } from '../utils/cache.js';
import { CreateTopicInput, UpdateTopicInput } from '@algoforge/shared';
import { topicRepository } from '../repositories/topic.repository.js';

export interface TopicFilters {
  difficulty?: string;
  platform?: string;
  isSolved?: string;
  isStarred?: string;
  tag?: string;
}

export const getAllTopics = async (userId: string, filters: TopicFilters = {}) => {
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

  const topics = await topicRepository.findManyWithFilters(userId, questionFilter);

  if (!hasFilters) {
    await cache.setWithTag(cacheKey, `user:${userId}`, topics, 300);
  }
  return topics;
};

export const createTopic = async (userId: string, data: CreateTopicInput) => {
  const count = await topicRepository.countByUserId(userId);
  const topic = await topicRepository.create({
    ...data,
    order: count,
    userId,
  });
  await cache.invalidateTag(`user:${userId}`);
  return topic;
};

export const updateTopic = async (topicId: string, userId: string, data: UpdateTopicInput) => {
  const topic = await topicRepository.findFirstByIdAndUserId(topicId, userId);
  if (!topic) throw new AppError('Topic not found', 404);

  const updated = await topicRepository.update(topicId, data);
  await cache.invalidateTag(`user:${userId}`);
  return updated;
};

export const deleteTopic = async (topicId: string, userId: string) => {
  const topic = await topicRepository.findFirstByIdAndUserId(topicId, userId);
  if (!topic) throw new AppError('Topic not found', 404);

  await topicRepository.softDelete(topicId);
  await cache.invalidateTag(`user:${userId}`);
};

export const reorderTopics = async (userId: string, orderedIds: string[]) => {
  await topicRepository.reorder(userId, orderedIds);
  await cache.invalidateTag(`user:${userId}`);
};

