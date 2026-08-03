import { prisma } from '../config/database.js';
import { Prisma } from '@prisma/client';

export class GroupRepository {
  async create(data: Prisma.GroupCreateInput, userId: string) {
    return prisma.group.create({
      data: {
        ...data,
        members: {
          create: {
            userId,
            role: 'admin'
          }
        }
      },
      include: {
        members: { include: { user: { select: { id: true, name: true, username: true } } } }
      }
    });
  }

  async findByInviteCode(inviteCode: string) {
    return prisma.group.findUnique({ where: { inviteCode } });
  }

  async findById(id: string) {
    return prisma.group.findUnique({
      where: { id },
      include: {
        members: { include: { user: { select: { id: true, name: true, username: true } } } }
      }
    });
  }

  async addMember(groupId: string, userId: string) {
    return prisma.groupMember.create({
      data: { groupId, userId, role: 'member' }
    });
  }

  async isMember(groupId: string, userId: string) {
    const member = await prisma.groupMember.findUnique({
      where: { groupId_userId: { groupId, userId } }
    });
    return !!member;
  }
}

export const groupRepository = new GroupRepository();
