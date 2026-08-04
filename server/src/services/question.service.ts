import { AppError } from '../utils/AppError.js';
import { cache } from '../utils/cache.js';
import { CreateQuestionInput, UpdateNotesInput, AddAttemptInput } from '@algoforge/shared';
import { questionRepository } from '../repositories/question.repository.js';
import { topicRepository } from '../repositories/topic.repository.js';
import { subTopicRepository } from '../repositories/subtopic.repository.js';

const assertQuestionOwnership = async (userId: string, questionId: string) => {
  const question = await questionRepository.findFirstWithRelations(questionId);
  if (!question) throw new AppError('Question not found', 404);

  const ownerId = question.topic?.userId || question.subTopic?.topic.userId;
  if (ownerId !== userId) throw new AppError('Unauthorized', 403);
  
  return question;
};

export const createQuestion = async (userId: string, topicId: string, subTopicId: string | null, data: CreateQuestionInput) => {
  if (!topicId && !subTopicId) {
    throw new AppError('Question must belong to a topic or subtopic', 400);
  }

  const topic = await topicRepository.findFirstByIdAndUserId(topicId, userId);
  if (!topic) throw new AppError('Topic not found', 404);

  if (subTopicId) {
    const subTopic = await subTopicRepository.findFirstWithTopic(subTopicId);
    if (!subTopic || subTopic.topicId !== topicId) throw new AppError('Sub-topic not found', 404);
  }

  const count = await questionRepository.countByTopicOrSubTopic(topicId, subTopicId || undefined);

  const question = await questionRepository.create({
    ...data,
    order: count,
    topicId: subTopicId ? null : topicId,
    subTopicId: subTopicId || null,
  });
  
  await cache.invalidateTag(`user:${userId}`);
  return question;
};

export const updateQuestion = async (userId: string, questionId: string, data: Partial<CreateQuestionInput> & Partial<UpdateNotesInput>) => {
  await assertQuestionOwnership(userId, questionId);
  const updated = await questionRepository.update(questionId, data);
  await cache.invalidateTag(`user:${userId}`);
  return updated;
};

export const deleteQuestion = async (userId: string, questionId: string) => {
  await assertQuestionOwnership(userId, questionId);
  await questionRepository.softDelete(questionId);
  await cache.invalidateTag(`user:${userId}`);
};

export const toggleSolved = async (userId: string, questionId: string) => {
  const question = await assertQuestionOwnership(userId, questionId);
  const updated = await questionRepository.update(questionId, { isSolved: !question.isSolved });
  await cache.invalidateTag(`user:${userId}`);
  return updated;
};

export const toggleStarred = async (userId: string, questionId: string) => {
  const question = await assertQuestionOwnership(userId, questionId);
  const updated = await questionRepository.update(questionId, { isStarred: !question.isStarred });
  await cache.invalidateTag(`user:${userId}`);
  return updated;
};


export const addAttempt = async (userId: string, questionId: string, data: AddAttemptInput) => {
  await assertQuestionOwnership(userId, questionId);

  // Spaced Repetition calculation
  const nextReviewAt = new Date();
  if (data.confidence) {
    const daysToAdd = ({
      5: 14,
      4: 7,
      3: 3,
      2: 1,
      1: 0,
    } as Record<number, number>)[data.confidence] ?? 0;
    
    if (daysToAdd > 0) {
      nextReviewAt.setDate(nextReviewAt.getDate() + daysToAdd);
    }
  }

  const [attempt, updatedQuestion] = await questionRepository.addAttemptTransaction(
    userId,
    questionId,
    data.duration,
    data.confidence,
    nextReviewAt
  );

  await cache.invalidateTag(`user:${userId}`);
  return updatedQuestion;
};

export const reorderQuestions = async (userId: string, orderedIds: string[]) => {
  if (orderedIds.length === 0) return;
  // Verify ownership of the first question, assume rest are same topic/subtopic
  await assertQuestionOwnership(userId, orderedIds[0]);
  await questionRepository.reorder(orderedIds);
  await cache.invalidateTag(`user:${userId}`);
};
