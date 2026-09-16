import { notificationRepository } from '../repositories/notification.repository.js';
import { cache } from '../utils/cache.js';

export const notificationService = {
  createNotification: async (userId: string, title: string, message: string, type = 'info', link?: string) => {
    const notification = await notificationRepository.createNotification({ userId, title, message, type, link });
    await cache.invalidateTag(`user:${userId}:notifications`);
    return notification;
  },

  createNotificationsBulk: async (notifications: { userId: string; title: string; message: string; type?: string; link?: string }[]) => {
    const result = await notificationRepository.createManyNotifications(notifications);
    // Invalidate cache for all affected users
    const uniqueUserIds = [...new Set(notifications.map(n => n.userId))];
    await Promise.all(uniqueUserIds.map(userId => cache.invalidateTag(`user:${userId}:notifications`)));
    return result;
  },

  getUserNotifications: async (userId: string) => {
    const cacheKey = `notifications:${userId}`;
    
    const cached = await cache.get<any>(cacheKey);
    if (cached) return cached;
    
    const [notifications, unreadCount] = await Promise.all([
      notificationRepository.getNotifications(userId),
      notificationRepository.getUnreadCount(userId),
    ]);
    
    const data = { notifications, unreadCount };
    await cache.setWithTag(cacheKey, `user:${userId}:notifications`, data, 300);
    return data;
  },

  markAsRead: async (userId: string, notificationIds: string[]) => {
    const result = await notificationRepository.markAsRead(userId, notificationIds);
    await cache.invalidateTag(`user:${userId}:notifications`);
    return result;
  },

  markAllAsRead: async (userId: string) => {
    const result = await notificationRepository.markAllAsRead(userId);
    await cache.invalidateTag(`user:${userId}:notifications`);
    return result;
  },
};
