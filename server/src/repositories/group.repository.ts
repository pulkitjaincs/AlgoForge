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

  async findByUserId(userId: string) {
    return prisma.group.findMany({
      where: {
        members: {
          some: { userId }
        }
      },
      include: {
        _count: { select: { members: true } }
      }
    });
  }

  async removeMember(groupId: string, userId: string) {
    return prisma.groupMember.delete({
      where: { groupId_userId: { groupId, userId } }
    });
  }

  async countMembers(groupId: string) {
    return prisma.groupMember.count({
      where: { groupId }
    });
  }

  async delete(id: string) {
    return prisma.group.delete({
      where: { id }
    });
  }

  async leaveGroupTransaction(groupId: string, userId: string) {
    return prisma.$transaction(async (tx) => {
      await tx.groupMember.delete({
        where: { groupId_userId: { groupId, userId } }
      });

      const memberCount = await tx.groupMember.count({
        where: { groupId }
      });

      if (memberCount === 0) {
        await tx.group.delete({
          where: { id: groupId }
        });
      }
    });
  }
}

export const groupRepository = new GroupRepository();
