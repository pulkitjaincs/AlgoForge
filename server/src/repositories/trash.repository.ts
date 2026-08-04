import { prisma } from '../config/database.js';

export class TrashRepository {
  async getTrashItems(userId: string) {
    const topics = await prisma.topic.findMany({
      where: { userId, deletedAt: { not: null } },
    });

    const subTopics = await prisma.subTopic.findMany({
      where: { topic: { userId }, deletedAt: { not: null } },
    });

    const questions = await prisma.question.findMany({
      where: {
        OR: [
          { topic: { userId } },
          { subTopic: { topic: { userId } } }
        ],
        deletedAt: { not: null }
      },
    });

    return { topics, subTopics, questions };
  }

  async findTopicInTrash(userId: string, id: string) {
    return prisma.topic.findFirst({ where: { id, userId, deletedAt: { not: null } } });
  }

  async findSubTopicInTrash(userId: string, id: string) {
    return prisma.subTopic.findFirst({ where: { id, topic: { userId }, deletedAt: { not: null } } });
  }

  async findQuestionInTrash(userId: string, id: string) {
    return prisma.question.findFirst({
      where: {
        id,
        OR: [
          { topic: { userId } },
          { subTopic: { topic: { userId } } }
        ],
        deletedAt: { not: null }
      }
    });
  }

  async restoreTopic(id: string) {
    return prisma.topic.update({ where: { id }, data: { deletedAt: null } });
  }

  async restoreSubTopic(id: string) {
    return prisma.subTopic.update({ where: { id }, data: { deletedAt: null } });
  }

  async restoreQuestion(id: string) {
    return prisma.question.update({ where: { id }, data: { deletedAt: null } });
  }

  async deleteTopic(id: string) {
    return prisma.topic.delete({ where: { id } });
  }

  async deleteSubTopic(id: string) {
    return prisma.subTopic.delete({ where: { id } });
  }

  async deleteQuestion(id: string) {
    return prisma.question.delete({ where: { id } });
  }
}

export const trashRepository = new TrashRepository();
