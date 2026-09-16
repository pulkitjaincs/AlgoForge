import { Job } from 'bullmq';
import { logger } from '../../utils/logger.js';
import { prisma } from '../../config/database.js';
import { topicRepository } from '../../repositories/topic.repository.js';
import { cache } from '../../utils/cache.js';
import { notificationService } from '../../services/notification.service.js';

export const processDataExport = async (job: Job) => {
  const { userId } = job.data;
  logger.info(`Starting data export for user ${userId}`);
  
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, name: true, username: true, email: true, createdAt: true }
    });

    const topics = await topicRepository.findManyWithAllQuestions(userId);
    const attempts = await prisma.questionAttempt.findMany({ where: { userId } });
    const groups = await prisma.groupMember.findMany({ 
      where: { userId },
      include: { group: true }
    });
    const integrations = await prisma.platformIntegration.findMany({ where: { userId } });

    const exportData = {
      version: '1.0',
      exportedAt: new Date().toISOString(),
      user,
      topics,
      attempts,
      groups: groups.map(g => g.group),
      integrations
    };

    const cacheKey = `export:${userId}`;
    // Store in cache for 24 hours
    await cache.set(cacheKey, exportData, 24 * 60 * 60);

    if (notificationService) {
      await notificationService.createNotification(
        userId,
        'Data Export Ready',
        'Your data export is ready to download.',
        'success',
        '/api/v1/export/download'
      );
    }

    logger.info(`Data export complete for user ${userId}`);
    return { success: true };
  } catch (error) {
    logger.error({ err: error instanceof Error ? error : new Error(String(error)) }, `Data export failed for user ${userId}`);
    
    if (notificationService) {
      await notificationService.createNotification(
        userId,
        'Data Export Failed',
        'There was an error generating your data export.',
        'error'
      );
    }
    throw error;
  }
};

