import { prisma } from '../config/database.js';
import { Prisma } from '@prisma/client';

export class IntegrationRepository {
  async findByUserId(userId: string) {
    return prisma.platformIntegration.findMany({
      where: { userId },
    });
  }

  async findByUserIdAndPlatform(userId: string, platform: string) {
    return prisma.platformIntegration.findUnique({
      where: {
        userId_platform: { userId, platform }
      }
    });
  }

  async createOrUpdate(userId: string, platform: string, data: Omit<Prisma.PlatformIntegrationCreateInput, 'user' | 'userId' | 'platform'>) {
    return prisma.platformIntegration.upsert({
      where: {
        userId_platform: { userId, platform }
      },
      update: {
        ...data,
        lastSyncedAt: new Date()
      },
      create: {
        userId,
        platform,
        ...data
      }
    });
  }

  async update(id: string, data: Prisma.PlatformIntegrationUpdateInput) {
    return prisma.platformIntegration.update({
      where: { id },
      data: {
        ...data,
        lastSyncedAt: new Date()
      }
    });
  }

  async delete(userId: string, platform: string) {
    return prisma.platformIntegration.delete({
      where: {
        userId_platform: { userId, platform }
      }
    });
  }
}

export const integrationRepository = new IntegrationRepository();
