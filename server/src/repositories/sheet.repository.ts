import { prisma } from '../config/database.js';
import { Prisma } from '@prisma/client';

export class SheetRepository {
  async create(data: Prisma.SheetCreateInput) {
    return prisma.sheet.create({ data });
  }

  async findPublicSheets(page: number = 1, limit: number = 20) {
    const skip = (page - 1) * limit;
    
    const [data, total] = await Promise.all([
      prisma.sheet.findMany({
        where: { isPublic: true },
        include: {
          author: { select: { name: true, username: true, avatarUrl: true } }
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.sheet.count({ where: { isPublic: true } })
    ]);

    return { data, total, page, limit };
  }

  async findById(id: string) {
    return prisma.sheet.findUnique({
      where: { id },
      include: {
        author: { select: { name: true, username: true, avatarUrl: true } }
      }
    });
  }

  async incrementCloneCount(id: string) {
    return prisma.sheet.update({
      where: { id },
      data: { cloneCount: { increment: 1 } }
    });
  }

  async delete(id: string) {
    return prisma.sheet.delete({
      where: { id }
    });
  }

  async findByAuthorId(authorId: string) {
    return prisma.sheet.findMany({
      where: { authorId },
      include: {
        author: { select: { name: true, username: true, avatarUrl: true } }
      },
      orderBy: { createdAt: 'desc' }
    });
  }
}

export const sheetRepository = new SheetRepository();
