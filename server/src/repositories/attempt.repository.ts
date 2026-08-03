import { prisma } from '../config/database.js';

export class AttemptRepository {
  async findManyByUserIdInDateRange(userId: string, startDate: Date, endDate?: Date) {
    return prisma.questionAttempt.findMany({
      where: {
        userId,
        solvedAt: { gte: startDate, ...(endDate ? { lte: endDate } : {}) }
      },
      select: { solvedAt: true }
    });
  }

  async findRecentAttempts(userId: string) {
    return prisma.questionAttempt.findMany({
      where: { userId },
      orderBy: { solvedAt: 'desc' },
      select: { solvedAt: true }
    });
  }

  async findAllByUserId(userId: string) {
    return prisma.questionAttempt.findMany({
      where: { userId },
      orderBy: { solvedAt: 'desc' },
      select: { solvedAt: true }
    });
  }

  async findManyFromDate(userId: string, startDate: Date) {
    return prisma.questionAttempt.findMany({
      where: {
        userId,
        solvedAt: { gte: startDate }
      }
    });
  }
}

export const attemptRepository = new AttemptRepository();
