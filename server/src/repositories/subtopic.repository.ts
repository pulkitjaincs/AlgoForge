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

  async updateOrder(topicId: string, id: string, order: number) {
    return prisma.subTopic.updateMany({
      where: { id, topicId, deletedAt: null },
      data: { order },
    });
  }
}

export const subTopicRepository = new SubTopicRepository();
