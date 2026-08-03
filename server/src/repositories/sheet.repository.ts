import { prisma } from '../config/database.js';
import { Prisma } from '@prisma/client';

export class SheetRepository {
  async create(data: Prisma.SheetCreateInput) {
    return prisma.sheet.create({ data });
  }

  async findPublicSheets() {
    return prisma.sheet.findMany({
      where: { isPublic: true },
      include: {
        author: { select: { name: true, username: true, avatarUrl: true } }
      },
      orderBy: { createdAt: 'desc' }
    });
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
