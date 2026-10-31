import { sheetRepository } from '../repositories/sheet.repository.js';
import { topicRepository } from '../repositories/topic.repository.js';
import { PublishSheetInput } from '@algoforge/shared';
import { AppError } from '../utils/AppError.js';
import { backgroundQueue } from '../workers/queues.js';
import { prisma } from '../config/database.js';
import { cache } from '../utils/cache.js';
import { notificationService } from './notification.service.js';
import { logger } from '../utils/logger.js';

export const publishSheet = async (userId: string, data: PublishSheetInput) => {
  const topics = await topicRepository.findManyWithAllQuestions(userId);
  
  if (!topics || topics.length === 0) {
    throw new AppError('Cannot publish an empty sheet', 400);
  }

  if (topics.length > 100) {
    throw new AppError('Sheet exceeds maximum allowed topics (100)', 400);
  }

  let totalQuestions = 0;
  for (const topic of topics) {
    totalQuestions += (topic.questions?.length || 0);
    if (topic.subTopics) {
      for (const sub of topic.subTopics) {
        totalQuestions += (sub.questions?.length || 0);
      }
    }
  }

  if (totalQuestions > 1000) {
    throw new AppError('Sheet exceeds maximum allowed questions (1000)', 400);
  }

  const serialized = JSON.stringify(topics);
  if (Buffer.byteLength(serialized, 'utf8') > 2 * 1024 * 1024) {
    throw new AppError('Sheet data payload exceeds 2MB limit', 400);
  }

  const snapshot = JSON.parse(serialized);
  
  return sheetRepository.create({
    title: data.title,
    description: data.description,
    isPublic: data.isPublic ?? true,
    author: { connect: { id: userId } },
    topics: snapshot,
  });
};

export const getPublicSheets = async (page: number = 1, limit: number = 20) => {
  return sheetRepository.findPublicSheets(page, limit);
};

export const getSheetById = async (id: string, userId?: string) => {
  const sheet = await sheetRepository.findById(id);
  if (!sheet) {
    throw new AppError('Sheet not found', 404);
  }
  if (!sheet.isPublic && sheet.authorId !== userId) {
    throw new AppError('Sheet is private', 403);
  }
  return sheet;
};

export const executeCloneTransaction = async (userId: string, sheetId: string) => {
  const sheet = await getSheetById(sheetId, userId);
  const topicsSnapshot = (sheet.topics as any[]) || [];

  const currentTopicCount = await prisma.topic.count({ where: { userId } });
  let globalTopicOrder = currentTopicCount;

  await prisma.$transaction(async (tx) => {
    for (const topicData of topicsSnapshot) {
      const topic = await tx.topic.create({
        data: {
          title: topicData.title,
          description: topicData.description || '',
          order: globalTopicOrder++,
          status: 'Pending',
          userId,
        },
        select: { id: true },
      });

      const subtopicsList = topicData.subTopics || topicData.subtopics || [];
      if (subtopicsList && subtopicsList.length > 0) {
        for (const subTopicData of subtopicsList) {
          const subTopic = await tx.subTopic.create({
            data: {
              title: subTopicData.title,
              order: subTopicData.order ?? 0,
              topicId: topic.id,
            },
            select: { id: true },
          });

          if (subTopicData.questions && subTopicData.questions.length > 0) {
            await tx.question.createMany({
              data: subTopicData.questions.map((q: any, qIdx: number) => ({
                title: q.title,
                difficulty: q.difficulty || 'Medium',
                order: q.order ?? qIdx,
                problemUrl: q.problemUrl || '#',
                platform: q.platform || 'leetcode',
                resource: q.resource || '#',
                companyTags: q.companyTags || [],
                topicId: topic.id,
                subTopicId: subTopic.id,
              })),
            });
          }
        }
      }

      if (topicData.questions && topicData.questions.length > 0) {
        await tx.question.createMany({
          data: topicData.questions.map((q: any, qIdx: number) => ({
            title: q.title,
            difficulty: q.difficulty || 'Medium',
            order: q.order ?? qIdx,
            problemUrl: q.problemUrl || '#',
            platform: q.platform || 'leetcode',
            resource: q.resource || '#',
            companyTags: q.companyTags || [],
            topicId: topic.id,
            subTopicId: null,
          })),
        });
      }
    }
  });

  await sheetRepository.incrementCloneCount(sheetId);
  await cache.invalidateTag(`user:${userId}:topics`);
  await cache.invalidateTag(`user:${userId}:analytics`);

  await notificationService.createNotification(
    userId,
    'Sheet Cloned Successfully',
    `"${sheet.title}" has been cloned into your workspace.`,
    'success',
    '/app/sheet'
  );

  return { success: true, message: `Sheet "${sheet.title}" cloned successfully into workspace` };
};

export const cloneSheet = async (userId: string, sheetId: string) => {
  const sheet = await getSheetById(sheetId, userId);

  if (!sheet.isPublic && sheet.authorId !== userId) {
    throw new AppError('Sheet is not public', 403);
  }

  // Attempt async queue if available
  if (backgroundQueue) {
    try {
      await backgroundQueue.add('sheet-clone', { userId, sheetId }, {
        attempts: 3,
        backoff: { type: 'exponential', delay: 1000 },
      });
      await sheetRepository.incrementCloneCount(sheetId);
      return { success: true, message: 'Cloning started in background' };
    } catch (queueErr) {
      logger.warn({ queueErr }, 'Queue unavailable, falling back to synchronous clone');
    }
  }

  // Synchronous fallback ensures 100% reliability even when BullMQ/Redis worker is offline
  return await executeCloneTransaction(userId, sheetId);
};

export const deleteSheet = async (userId: string, sheetId: string) => {
  const sheet = await getSheetById(sheetId, userId);
  if (sheet.authorId !== userId) {
    throw new AppError('Only the sheet author can delete this sheet', 403);
  }

  await sheetRepository.delete(sheetId);
  return { success: true, message: 'Sheet deleted successfully' };
};

export const getMySheets = async (userId: string) => {
  return await sheetRepository.findByAuthorId(userId);
};
