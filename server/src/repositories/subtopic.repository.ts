import { prisma } from '../config/database.js';
import { Prisma } from '@prisma/client';

export class SubTopicRepository {
  async countByTopicId(topicId: string): Promise<number> {
    return prisma.subTopic.count({ where: { topicId } });
  }

  async create(data: Prisma.SubTopicUncheckedCreateInput) {
    return prisma.subTopic.create({ data });
  }

  async findFirstWithTopic(id: string) {
    return prisma.subTopic.findFirst({
      where: { id, deletedAt: null },
      include: { topic: true },
    });
  }

  async update(id: string, data: Prisma.SubTopicUpdateInput) {
    return prisma.subTopic.update({
      where: { id },
      data,
    });
  }

  async softDelete(id: string) {
    return prisma.subTopic.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }

  async reorder(topicId: string, orderedIds: string[]) {
    if (orderedIds.length === 0) return;
    const params: any[] = [topicId];
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
      UPDATE "SubTopic"
      SET "order" = CASE id
        ${caseParts.join(' ')}
      END
      WHERE id IN (${inParts.join(', ')}) AND "topicId" = $1 AND "deletedAt" IS NULL;
    `;
    return prisma.$executeRawUnsafe(query, ...params);
  }
}

export const subTopicRepository = new SubTopicRepository();
