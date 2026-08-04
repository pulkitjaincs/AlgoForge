import { AppError } from '../utils/AppError.js';
import { cache } from '../utils/cache.js';
import { CreateSubTopicInput, UpdateSubTopicInput } from '@algoforge/shared';
import { subTopicRepository } from '../repositories/subtopic.repository.js';
import { topicRepository } from '../repositories/topic.repository.js';

export const createSubTopic = async (userId: string, topicId: string, data: CreateSubTopicInput) => {
  const topic = await topicRepository.findFirstByIdAndUserId(topicId, userId);
  if (!topic) throw new AppError('Topic not found', 404);

  const count = await subTopicRepository.countByTopicId(topicId);
  
  const subTopic = await subTopicRepository.create({
    ...data,
    order: count,
    topicId,
  });
  await cache.invalidateTag(`user:${userId}`);
  return subTopic;
};

export const updateSubTopic = async (userId: string, subTopicId: string, data: UpdateSubTopicInput) => {
  const subTopic = await subTopicRepository.findFirstWithTopic(subTopicId);

  if (!subTopic) throw new AppError('Sub-topic not found', 404);
  if (subTopic.topic.userId !== userId || subTopic.topic.deletedAt !== null) throw new AppError('Unauthorized or topic deleted', 403);

  const updated = await subTopicRepository.update(subTopicId, data);
  await cache.invalidateTag(`user:${userId}`);
  return updated;
};

export const deleteSubTopic = async (userId: string, subTopicId: string) => {
  const subTopic = await subTopicRepository.findFirstWithTopic(subTopicId);

  if (!subTopic) throw new AppError('Sub-topic not found', 404);
  if (subTopic.topic.userId !== userId || subTopic.topic.deletedAt !== null) throw new AppError('Unauthorized or topic deleted', 403);

  await subTopicRepository.softDelete(subTopicId);
  await cache.invalidateTag(`user:${userId}`);
};

export const reorderSubTopics = async (userId: string, topicId: string, orderedIds: string[]) => {
  const topic = await topicRepository.findFirstByIdAndUserId(topicId, userId);
  if (!topic) throw new AppError('Topic not found', 404);

  await subTopicRepository.reorder(topicId, orderedIds);
  await cache.invalidateTag(`user:${userId}`);
};

