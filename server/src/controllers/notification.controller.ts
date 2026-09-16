import { Request, Response } from 'express';
import { notificationService } from '../services/notification.service.js';

export const getNotifications = async (req: Request, res: Response) => {
  const userId = req.user!.id;
  const data = await notificationService.getUserNotifications(userId);
  res.status(200).json(data);
};

export const markAsRead = async (req: Request, res: Response) => {
  const userId = req.user!.id;
  const { notificationIds } = req.body;
  
  if (!notificationIds || !Array.isArray(notificationIds)) {
    return res.status(400).json({ error: 'notificationIds array is required' });
  }

  await notificationService.markAsRead(userId, notificationIds);
  res.status(200).json({ message: 'Notifications marked as read' });
};

export const markAllAsRead = async (req: Request, res: Response) => {
  const userId = req.user!.id;
  await notificationService.markAllAsRead(userId);
  res.status(200).json({ message: 'All notifications marked as read' });
};
