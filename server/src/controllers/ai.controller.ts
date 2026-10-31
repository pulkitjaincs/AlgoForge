import { Request, Response } from 'express';
import * as aiService from '../services/ai.service.js';

export const getCoachPlan = async (req: Request, res: Response) => {
  const forceRefresh = req.query.force === 'true';
  const plan = await aiService.getAICoachPlan(req.user!.id, forceRefresh);
  res.status(200).json({ success: true, data: plan });
};

export const getHint = async (req: Request, res: Response) => {
  const { questionId, hintLevel, userCode, currentApproach } = req.body;
  const hint = await aiService.getSocraticHint(
    req.user!.id,
    questionId,
    hintLevel,
    userCode,
    currentApproach
  );
  res.status(200).json({ success: true, data: hint });
};
