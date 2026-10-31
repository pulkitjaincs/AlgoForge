import { Request, Response } from 'express';
import * as sheetAgentService from '../services/sheetAgent.service.js';

export const planAction = async (req: Request, res: Response) => {
  const diff = await sheetAgentService.planSheetAction(req.user!.id, req.body);
  res.status(200).json({ success: true, data: diff });
};

export const applyAction = async (req: Request, res: Response) => {
  const result = await sheetAgentService.applySheetAction(req.user!.id, req.body);
  res.status(200).json({ success: true, data: result });
};
