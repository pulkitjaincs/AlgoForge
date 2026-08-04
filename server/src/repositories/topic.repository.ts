import { prisma } from '../config/database.js';
import { Prisma } from '@prisma/client';

export class TopicRepository {
  async countByUserId(userId: string): Promise<number> {
    return prisma.topic.count({ where: { userId } });
  }

  async create(data: Prisma.TopicUncheckedCreateInput) {
    return prisma.topic.create({ data });
  }

  async findFirstByIdAndUserId(id: string, userId: string) {
    return prisma.topic.findFirst({
      where: { id, userId, deletedAt: null },
    });
  }

  async update(id: string, data: Prisma.TopicUpdateInput) {
    return prisma.topic.update({
      where: { id },
      data,
    });
  }

  async softDelete(id: string) {
    return prisma.topic.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }

  async reorder(userId: string, orderedIds: string[]) {
    const updates = orderedIds.map((id, index) =>
      prisma.topic.updateMany({
        where: { id, userId, deletedAt: null },
        data: { order: index },
      })
    );
    return prisma.$transaction(updates);
  }

  async findManyWithFilters(userId: string, questionFilter: any) {
    return prisma.topic.findMany({
      where: { userId, deletedAt: null },
      orderBy: { order: 'asc' },
      include: {
        subTopics: {
          where: { deletedAt: null },
          orderBy: { order: 'asc' },
          include: {
            questions: { 
              where: questionFilter,
              orderBy: { order: 'asc' } 
            },
          },
        },
        questions: { 
          where: questionFilter,
          orderBy: { order: 'asc' } 
        },
      },
    });
  }

  async findManyWithAllQuestions(userId: string) {
    return prisma.topic.findMany({
      where: { userId, deletedAt: null },
      include: {
        questions: { where: { deletedAt: null } },
        subTopics: {
          include: { questions: { where: { deletedAt: null } } }
        }
      }
    });
  }
}

export const topicRepository = new TopicRepository();
