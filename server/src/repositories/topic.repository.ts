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
    if (orderedIds.length === 0) return;
    const params: any[] = [userId];
    const caseParts: string[] = [];
    const inParts: string[] = [];

    orderedIds.forEach((id, index) => {
      params.push(id);
      const idParam = `$${params.length}`;
      params.push(index);
      const indexParam = `$${params.length}`;
      
      caseParts.push(`WHEN ${idParam} THEN ${indexParam}::integer`);
      inParts.push(idParam);
    });

    const query = `
      UPDATE "Topic"
      SET "order" = CASE id
        ${caseParts.join(' ')}
      END
      WHERE id IN (${inParts.join(', ')}) AND "userId" = $1 AND "deletedAt" IS NULL;
    `;
    return prisma.$executeRawUnsafe(query, ...params);
  }

  async findManyWithFilters(userId: string, questionFilter: any) {
    const questionSelect = {
      id: true,
      title: true,
      isSolved: true,
      difficulty: true,
      order: true,
      problemUrl: true,
      platform: true,
      companyTags: true,
      isStarred: true,
      notes: true,
      topicId: true,
      subTopicId: true,
    };

    return prisma.topic.findMany({
      where: { userId, deletedAt: null },
      orderBy: { order: 'asc' },
      select: {
        id: true,
        title: true,
        description: true,
        order: true,
        status: true,
        subTopics: {
          where: { deletedAt: null },
          orderBy: { order: 'asc' },
          select: {
            id: true,
            title: true,
            order: true,
            topicId: true,
            questions: { 
              where: questionFilter,
              orderBy: { order: 'asc' },
              select: questionSelect
            },
          },
        },
        questions: { 
          where: questionFilter,
          orderBy: { order: 'asc' },
          select: questionSelect
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
