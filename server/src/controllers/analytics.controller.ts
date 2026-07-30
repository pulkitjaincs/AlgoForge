import { Request, Response } from 'express';
import * as analyticsService from '../services/analytics.service.js';

export const getSummary = async (req: Request, res: Response) => {
  const data = await analyticsService.getSummary(req.user!.id);
  res.status(200).json({ success: true, data });
};

export const getHeatmap = async (req: Request, res: Response) => {
  const year = parseInt(req.query.year as string) || new Date().getFullYear();
  const data = await analyticsService.getHeatmap(req.user!.id, year);
  res.status(200).json({ success: true, data });
};

export const getStreaks = async (req: Request, res: Response) => {
  const data = await analyticsService.getStreaks(req.user!.id);
  res.status(200).json({ success: true, data });
};

export const getTopicMastery = async (req: Request, res: Response) => {
  const data = await analyticsService.getTopicMastery(req.user!.id);
  res.status(200).json({ success: true, data });
};

export const getWeakAreas = async (req: Request, res: Response) => {
  const data = await analyticsService.getWeakAreas(req.user!.id);
  res.status(200).json({ success: true, data });
};

export const getVelocity = async (req: Request, res: Response) => {
  const period = (req.query.period as string) || 'weekly';
  const data = await analyticsService.getVelocity(req.user!.id, period);
  res.status(200).json({ success: true, data });
};
