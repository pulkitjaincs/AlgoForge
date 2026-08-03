import { AppError } from '../utils/AppError.js';
import { cache } from '../utils/cache.js';
import { CreateQuestionInput, UpdateNotesInput, AddAttemptInput } from '@algoforge/shared';
import { questionRepository } from '../repositories/question.repository.js';
import { topicRepository } from '../repositories/topic.repository.js';
import { subTopicRepository } from '../repositories/subtopic.repository.js';

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
  const question = await questionRepository.findFirstWithRelations(questionId);

  if (!question) throw new AppError('Question not found', 404);

  const ownerId = question.topic?.userId || question.subTopic?.topic.userId;
  if (ownerId !== userId) throw new AppError('Unauthorized', 403);

  const updated = await questionRepository.update(questionId, data);
  await cache.invalidateTag(`user:${userId}`);
  return updated;
};

export const deleteQuestion = async (userId: string, questionId: string) => {
  const question = await questionRepository.findFirstWithRelations(questionId);

  if (!question) throw new AppError('Question not found', 404);
  
  const ownerId = question.topic?.userId || question.subTopic?.topic.userId;
  if (ownerId !== userId) throw new AppError('Unauthorized', 403);

  await questionRepository.softDelete(questionId);
  await cache.invalidateTag(`user:${userId}`);
};

export const toggleSolved = async (userId: string, questionId: string) => {
  const question = await questionRepository.findFirstWithRelations(questionId);

  if (!question) throw new AppError('Question not found', 404);

  const ownerId = question.topic?.userId || question.subTopic?.topic.userId;
  if (ownerId !== userId) throw new AppError('Unauthorized', 403);

  const updated = await questionRepository.update(questionId, { isSolved: !question.isSolved });
  await cache.invalidateTag(`user:${userId}`);
  return updated;
};


export const addAttempt = async (userId: string, questionId: string, data: AddAttemptInput) => {
  const question = await questionRepository.findFirstWithRelations(questionId);

  if (!question) throw new AppError('Question not found', 404);

  const ownerId = question.topic?.userId || question.subTopic?.topic.userId;
  if (ownerId !== userId) throw new AppError('Unauthorized', 403);

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
