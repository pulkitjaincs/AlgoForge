import { prisma } from '../config/database.js';

export const integrationRepository = {
  findByUserId: (userId: string) => {
    return prisma.platformIntegration.findMany({
      where: { userId },
    });
  },

  findByUserIdAndPlatform: (userId: string, platform: string) => {
    return prisma.platformIntegration.findUnique({
      where: {
        userId_platform: { userId, platform }
      }
    });
  },

  createOrUpdate: (userId: string, platform: string, username: string, solvedCount: number, rating: number) => {
    return prisma.platformIntegration.upsert({
      where: {
        userId_platform: { userId, platform }
      },
      update: {
        username,
        solvedCount,
        rating,
        lastSyncedAt: new Date()
      },
      create: {
        userId,
        platform,
        username,
        solvedCount,
        rating
      }
    });
  },

  delete: (userId: string, platform: string) => {
    return prisma.platformIntegration.delete({
      where: {
        userId_platform: { userId, platform }
      }
    });
  }
};
