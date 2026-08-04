import { prisma } from '../config/database.js';
import { Prisma } from '@prisma/client';

export class QuestionRepository {
  async countByTopicOrSubTopic(topicId?: string, subTopicId?: string): Promise<number> {
    return prisma.question.count({
      where: subTopicId ? { subTopicId, deletedAt: null } : { topicId, deletedAt: null }
    });
  }

  async create(data: Prisma.QuestionUncheckedCreateInput) {
    return prisma.question.create({ data });
  }

  async findFirstWithRelations(id: string) {
    return prisma.question.findFirst({
      where: { id, deletedAt: null },
      include: { topic: true, subTopic: { include: { topic: true } } },
    });
  }

  async update(id: string, data: Prisma.QuestionUpdateInput) {
    return prisma.question.update({
      where: { id },
      data,
    });
  }

  async softDelete(id: string) {
    return prisma.question.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }

  async addAttemptTransaction(
    userId: string,
    questionId: string,
    duration: number | undefined,
    confidence: number | undefined,
    nextReviewAt: Date
  ) {
    return prisma.$transaction([
      prisma.questionAttempt.create({
        data: {
          userId,
          questionId,
          duration,
          confidence,
        },
      }),
      prisma.question.update({
        where: { id: questionId },
        data: {
          lastAttemptedAt: new Date(),
          attemptCount: { increment: 1 },
          nextReviewAt,
          isSolved: true,
        },
      }),
    ]);
  }

  async findReviewQueue(userId: string, maxDate: Date, limit?: number) {
    return prisma.question.findMany({
      where: {
        AND: [
          { OR: [{ topic: { userId } }, { subTopic: { topic: { userId } } }] },
          { deletedAt: null },
          { nextReviewAt: { not: null } },
          { nextReviewAt: { lte: maxDate } }
        ]
      },
      orderBy: { nextReviewAt: 'asc' },
      include: { topic: true, subTopic: { include: { topic: true } } },
      ...(limit ? { take: limit } : {})
    });
  }

  async countReviewQueue(userId: string, maxDate: Date) {
    return prisma.question.count({
      where: {
        AND: [
          { OR: [{ topic: { userId } }, { subTopic: { topic: { userId } } }] },
          { deletedAt: null },
          { nextReviewAt: { not: null } },
          { nextReviewAt: { lte: maxDate } }
        ]
      }
    });
  }

  async findWeakQuestions(userId: string, weakTopicIds: string[], limit: number) {
    return prisma.question.findMany({
      where: {
        AND: [
          { OR: [{ topic: { userId } }, { subTopic: { topic: { userId } } }] },
          { deletedAt: null },
          { isSolved: false },
          { OR: [{ topicId: { in: weakTopicIds } }, { subTopic: { topicId: { in: weakTopicIds } } }] }
        ]
      },
      take: limit,
      include: { topic: true, subTopic: { include: { topic: true } } }
    });
  }

  async findRandomUnsolved(userId: string, excludeIds: string[], limit: number) {
    const ids = await prisma.question.findMany({
      where: {
        AND: [
          { OR: [{ topic: { userId } }, { subTopic: { topic: { userId } } }] },
          { deletedAt: null },
          { isSolved: false },
          { id: { notIn: excludeIds } }
        ]
      },
      select: { id: true }
    });

    if (ids.length === 0) return [];

    // Fisher-Yates shuffle
    for (let i = ids.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [ids[i], ids[j]] = [ids[j], ids[i]];
    }
    const selectedIds = ids.slice(0, limit).map(q => q.id);

    return prisma.question.findMany({
      where: { id: { in: selectedIds } },
      include: { topic: true, subTopic: { include: { topic: true } } }
    });
  }

  async reorder(orderedIds: string[]) {
    const transactions = orderedIds.map((id, index) =>
      prisma.question.update({
        where: { id },
        data: { order: index },
      })
    );
    return prisma.$transaction(transactions);
  }
}

export const questionRepository = new QuestionRepository();
