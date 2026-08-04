import { Request, Response, NextFunction } from 'express';
import * as integrationService from '../services/integration.service.js';
import { z } from 'zod';

const linkSchema = z.object({
  platform: z.enum(['leetcode', 'codeforces', 'codechef', 'gfg', 'atcoder', 'github']),
  username: z.string().min(1),
  accessToken: z.string().optional(),
});

export const getIntegrations = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const integrations = await integrationService.getIntegrations(req.user!.id);
    res.json({ success: true, data: integrations });
  } catch (error) {
    next(error);
  }
};

export const linkIntegration = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { platform, username } = linkSchema.parse(req.body);
    const result = await integrationService.linkIntegration(req.user!.id, platform, username);
    const { _warning, ...data } = result as any;
    res.status(201).json({
      success: true,
      data,
      warning: _warning || null,
    });
  } catch (error) {
    next(error);
  }
};

export const unlinkIntegration = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { platform } = req.params;
    await integrationService.unlinkIntegration(req.user!.id, platform as string);
    res.json({ success: true, message: `Unlinked ${platform}` });
  } catch (error) {
    next(error);
  }
};

export const syncIntegrations = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await integrationService.syncAllIntegrations(req.user!.id);
    res.json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
};

export const getHeatmap = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const integrations = await integrationService.getIntegrations(req.user!.id);
    const activityMap = new Map<string, { count: number, platforms: Record<string, number> }>();
    
    for (const int of integrations) {
      const anyInt = int as any;
      if (anyInt.activityData && Array.isArray(anyInt.activityData)) {
        for (const record of anyInt.activityData) {
          if (record.date && typeof record.count === 'number') {
            const existing = activityMap.get(record.date) || { count: 0, platforms: {} };
            existing.count += record.count;
            existing.platforms[int.platform] = (existing.platforms[int.platform] || 0) + record.count;
            activityMap.set(record.date, existing);
          }
        }
      }
    }

    const data = Array.from(activityMap.entries()).map(([date, val]) => ({ date, count: val.count, platforms: val.platforms }));
    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
};
