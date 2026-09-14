import { Request, Response } from 'express';
import * as contestService from '../services/contest.service.js';

export const getContests = async (req: Request, res: Response) => {
  const platform = typeof req.query.platform === 'string' ? req.query.platform : undefined;
  const status = typeof req.query.status === 'string' ? req.query.status : undefined;

  const contests = await contestService.getUpcomingContests(platform, status);
  res.status(200).json({
    success: true,
    data: contests,
  });
};

export const getUserContestRatings = async (req: Request, res: Response) => {
  const ratings = await contestService.getUserContestRatings(req.user!.id);
  res.status(200).json({
    success: true,
    data: ratings,
  });
};
