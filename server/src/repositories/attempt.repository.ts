import { prisma } from '../config/database.js';

export class AttemptRepository {
  async findAttempts(userId: string, options?: { startDate?: Date; endDate?: Date; limit?: number }) {
    return prisma.questionAttempt.findMany({
      where: {
        userId,
        ...(options?.startDate || options?.endDate ? {
          solvedAt: {
            ...(options.startDate ? { gte: options.startDate } : {}),
            ...(options.endDate ? { lte: options.endDate } : {})
          }
        } : {})
      },
      orderBy: { solvedAt: 'desc' },
      ...(options?.limit ? { take: options.limit } : {}),
      select: { solvedAt: true }
    });
  }
}

export const attemptRepository = new AttemptRepository();
