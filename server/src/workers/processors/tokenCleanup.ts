import { Job } from 'bullmq';
import { logger } from '../../utils/logger.js';
import { prisma } from '../../config/database.js';

export const processTokenCleanup = async (job: Job) => {
  logger.info('Starting scheduled token cleanup...');

  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
  
  const [deletedExpired, deletedRevoked] = await prisma.$transaction([
    prisma.refreshToken.deleteMany({
      where: { expiresAt: { lt: new Date() } }
    }),
    prisma.refreshToken.deleteMany({
      where: { isRevoked: true, createdAt: { lt: sevenDaysAgo } }
    })
  ]);

  logger.info(`Token cleanup complete. Deleted ${deletedExpired.count} expired, ${deletedRevoked.count} old revoked tokens.`);
  return { expired: deletedExpired.count, revoked: deletedRevoked.count };
};
