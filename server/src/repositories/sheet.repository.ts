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
}

export const sheetRepository = new SheetRepository();
