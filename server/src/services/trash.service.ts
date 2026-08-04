import { trashRepository } from '../repositories/trash.repository.js';
import { AppError } from '../utils/AppError.js';
import { cache } from '../utils/cache.js';

export const getTrashItems = async (userId: string) => {
  return trashRepository.getTrashItems(userId);
};

export const restoreItem = async (userId: string, id: string, type: 'topic' | 'subtopic' | 'question') => {
  let updated;
  
  if (type === 'topic') {
    const topic = await trashRepository.findTopicInTrash(userId, id);
    if (!topic) throw new AppError('Topic not found in trash', 404);
    updated = await trashRepository.restoreTopic(id);
  } else if (type === 'subtopic') {
    const subTopic = await trashRepository.findSubTopicInTrash(userId, id);
    if (!subTopic) throw new AppError('Sub-topic not found in trash', 404);
    updated = await trashRepository.restoreSubTopic(id);
  } else {
    const question = await trashRepository.findQuestionInTrash(userId, id);
    if (!question) throw new AppError('Question not found in trash', 404);
    updated = await trashRepository.restoreQuestion(id);
  }

  await cache.invalidateTag(`user:${userId}`);
  return updated;
};

export const permanentlyDeleteItem = async (userId: string, id: string, type: 'topic' | 'subtopic' | 'question') => {
  if (type === 'topic') {
    const topic = await trashRepository.findTopicInTrash(userId, id);
    if (!topic) throw new AppError('Topic not found in trash', 404);
    await trashRepository.deleteTopic(id);
  } else if (type === 'subtopic') {
    const subTopic = await trashRepository.findSubTopicInTrash(userId, id);
    if (!subTopic) throw new AppError('Sub-topic not found in trash', 404);
    await trashRepository.deleteSubTopic(id);
  } else {
    const question = await trashRepository.findQuestionInTrash(userId, id);
    if (!question) throw new AppError('Question not found in trash', 404);
    await trashRepository.deleteQuestion(id);
  }

  await cache.invalidateTag(`user:${userId}`);
};
