import { prisma } from '../config/database.js';
import { Prisma } from '@prisma/client';

export class UserRepository {
  async findByEmail(email: string) {
    return prisma.user.findUnique({ where: { email } });
  }

  async create(data: Prisma.UserCreateInput) {
    return prisma.user.create({
      data,
      select: { id: true, name: true, email: true },
    });
  }

  async findById(id: string) {
    return prisma.user.findUnique({ where: { id } });
  }

  async findByUsername(username: string) {
    return prisma.user.findUnique({ where: { username } });
  }

  async update(id: string, data: Prisma.UserUpdateInput) {
    return prisma.user.update({
      where: { id },
      data,
      select: { id: true, name: true, email: true, username: true, bio: true, avatarUrl: true, isProfilePublic: true },
    });
  }
}

export const userRepository = new UserRepository();
