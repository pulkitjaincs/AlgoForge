import { prisma } from '../config/database.js';

export const notificationRepository = {
  createNotification: async (data: { userId: string; title: string; message: string; type?: string; link?: string }) => {
    return prisma.notification.create({
      data,
    });
  },

  createManyNotifications: async (data: { userId: string; title: string; message: string; type?: string; link?: string }[]) => {
    return prisma.notification.createMany({
      data,
    });
  },

  getNotifications: async (userId: string, limit = 50) => {
    return prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });
  },

  getUnreadCount: async (userId: string) => {
    return prisma.notification.count({
      where: { userId, isRead: false },
    });
  },

  markAsRead: async (userId: string, notificationIds: string[]) => {
    return prisma.notification.updateMany({
      where: {
        userId,
        id: { in: notificationIds },
      },
      data: { isRead: true },
    });
  },

  markAllAsRead: async (userId: string) => {
    return prisma.notification.updateMany({
      where: { userId, isRead: false },
      data: { isRead: true },
    });
  },
};
