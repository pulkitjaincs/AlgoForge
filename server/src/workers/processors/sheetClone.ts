import { Job } from 'bullmq';
import { logger } from '../../utils/logger.js';
import { prisma } from '../../config/database.js';
import { sheetRepository } from '../../repositories/sheet.repository.js';
import { notificationService } from '../../services/notification.service.js';

export const processSheetClone = async (job: Job) => {
  const { userId, sheetId } = job.data;
  logger.info(`Starting sheet clone for user ${userId}, sheet ${sheetId}`);
  
  try {
    const sheet = await sheetRepository.findById(sheetId);
    if (!sheet) {
      throw new Error(`Sheet ${sheetId} not found`);
    }

    const topicsSnapshot = sheet.topics as any[];
    
    // We want to count the current topics to preserve order if needed, but for simplicity, we can just append
    const currentTopicCount = await prisma.topic.count({ where: { userId } });
    let globalTopicOrder = currentTopicCount;

    await prisma.$transaction(async (tx) => {
      for (const topicData of topicsSnapshot) {
        const topicId = await tx.topic.create({
          data: {
            title: topicData.title,
            description: topicData.description,
            order: globalTopicOrder++,
            status: 'Pending',
            userId: userId,
          },
          select: { id: true }
        });

        // Insert subtopics and questions
        if (topicData.subTopics && topicData.subTopics.length > 0) {
          for (const subTopicData of topicData.subTopics) {
            const subTopicId = await tx.subTopic.create({
              data: {
                title: subTopicData.title,
                order: subTopicData.order,
                topicId: topicId.id,
              },
              select: { id: true }
            });

            if (subTopicData.questions && subTopicData.questions.length > 0) {
              await tx.question.createMany({
                data: subTopicData.questions.map((q: any) => ({
                  title: q.title,
                  difficulty: q.difficulty,
                  order: q.order,
                  problemUrl: q.problemUrl,
                  platform: q.platform,
                  resource: q.resource,
                  companyTags: q.companyTags || [],
                  topicId: topicId.id,
                  subTopicId: subTopicId.id,
                }))
              });
            }
          }
        }

        // Insert top-level topic questions
        if (topicData.questions && topicData.questions.length > 0) {
          await tx.question.createMany({
            data: topicData.questions.map((q: any) => ({
              title: q.title,
              difficulty: q.difficulty,
              order: q.order,
              problemUrl: q.problemUrl,
              platform: q.platform,
              resource: q.resource,
              companyTags: q.companyTags || [],
              topicId: topicId.id,
              subTopicId: null,
            }))
          });
        }
      }
    });

    // Generate Notification
    if (notificationService) {
      await notificationService.createNotification(
        userId,
        'Sheet Cloned Successfully',
        `The sheet "${sheet.title}" has been added to your account.`,
        'success',
        '/app/sheet'
      );
    }

    logger.info(`Sheet clone complete for user ${userId}, sheet ${sheetId}`);
    return { success: true };
  } catch (error) {
    logger.error({ err: error instanceof Error ? error : new Error(String(error)) }, `Sheet clone failed for user ${userId}, sheet ${sheetId}`);
    
    if (notificationService) {
      await notificationService.createNotification(
        userId,
        'Sheet Clone Failed',
        'There was an error cloning the sheet. Please try again.',
        'error'
      );
    }
    throw error;
  }
};
