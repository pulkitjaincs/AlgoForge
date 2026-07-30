import { Request, Response } from 'express';
import * as reviewService from '../services/review.service.js';

export const getQueue = async (req: Request, res: Response) => {
  const queue = await reviewService.getReviewQueue(req.user!.id);
  res.status(200).json({ success: true, data: queue });
};

export const getStats = async (req: Request, res: Response) => {
  const stats = await reviewService.getReviewStats(req.user!.id);
  res.status(200).json({ success: true, data: stats });
};
