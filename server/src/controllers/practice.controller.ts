import { Request, Response } from 'express';
import * as practiceService from '../services/practice.service.js';

export const getDailyPlan = async (req: Request, res: Response) => {
  const plan = await practiceService.getDailyPlan(req.user!.id);
  res.status(200).json({ success: true, data: plan });
};
