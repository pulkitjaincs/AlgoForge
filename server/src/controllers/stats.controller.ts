import { Request, Response } from 'express';
import { getGlobalProgressStats } from '../services/stats.service.js';

export const getStats = async (req: Request, res: Response) => {
  if (!req.user) return;
  const stats = await getGlobalProgressStats(req.user.id);
  res.json({ success: true, data: stats });
};
