import { prisma } from '../config/database.js';
import { AppError } from '../utils/AppError.js';
import { cache } from '../utils/cache.js';
import { CreateQuestionInput, UpdateNotesInput } from '../schemas/question.schema.js';

export const createQuestion = async (userId: string, topicId: string, subTopicId: string | null, data: CreateQuestionInput) => {
  if (!topicId && !subTopicId) {
    throw new AppError('Question must belong to a topic or subtopic', 400);
  }

  const topic = await prisma.topic.findFirst({ where: { id: topicId, userId, deletedAt: null } });
  if (!topic) throw new AppError('Topic not found', 404);

  if (subTopicId) {
    const subTopic = await prisma.subTopic.findFirst({ where: { id: subTopicId, topicId, deletedAt: null } });
    if (!subTopic) throw new AppError('Sub-topic not found', 404);
  }

  const count = await prisma.question.count({
    where: subTopicId ? { subTopicId, deletedAt: null } : { topicId, deletedAt: null }
  });

  const question = await prisma.question.create({
    data: {
      ...data,
      order: count,
      topicId: subTopicId ? null : topicId,
      subTopicId: subTopicId || null,
    },
  });
  
  await cache.invalidateTag(`user:${userId}`);
  return question;
};

export const updateQuestion = async (userId: string, questionId: string, data: Partial<CreateQuestionInput> & Partial<UpdateNotesInput>) => {
  const question = await prisma.question.findFirst({
    where: { id: questionId, deletedAt: null },
    include: { topic: true, subTopic: { include: { topic: true } } },
  });

  if (!question) throw new AppError('Question not found', 404);

  const ownerId = question.topic?.userId || question.subTopic?.topic.userId;
  if (ownerId !== userId) throw new AppError('Unauthorized', 403);

  const updated = await prisma.question.update({
    where: { id: questionId },
    data,
  });
  await cache.invalidateTag(`user:${userId}`);
  return updated;
};

export const deleteQuestion = async (userId: string, questionId: string) => {
  const question = await prisma.question.findFirst({
    where: { id: questionId, deletedAt: null },
    include: { topic: true, subTopic: { include: { topic: true } } },
  });

  if (!question) throw new AppError('Question not found', 404);
  
  const ownerId = question.topic?.userId || question.subTopic?.topic.userId;
  if (ownerId !== userId) throw new AppError('Unauthorized', 403);

  await prisma.question.update({
    where: { id: questionId },
    data: { deletedAt: new Date() }
  });
  await cache.invalidateTag(`user:${userId}`);
};

export const toggleSolved = async (userId: string, questionId: string) => {
  const question = await prisma.question.findFirst({
    where: { id: questionId, deletedAt: null },
    include: { topic: true, subTopic: { include: { topic: true } } },
  });

  if (!question) throw new AppError('Question not found', 404);

  const ownerId = question.topic?.userId || question.subTopic?.topic.userId;
  if (ownerId !== userId) throw new AppError('Unauthorized', 403);

  const updated = await prisma.question.update({
    where: { id: questionId },
    data: { isSolved: !question.isSolved },
  });
  await cache.invalidateTag(`user:${userId}`);
  return updated;
};

