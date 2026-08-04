import { Request, Response } from 'express';
import * as integrationService from '../services/integration.service.js';

export const getIntegrations = async (req: Request, res: Response) => {
  const integrations = await integrationService.getIntegrations(req.user!.id);
  res.status(200).json({ success: true, data: integrations });
};

export const linkIntegration = async (req: Request, res: Response) => {
  const { platform, username } = req.body;
  const result = await integrationService.linkIntegration(req.user!.id, platform, username);
  const { _warning, ...data } = result as any;
  res.status(201).json({
    success: true,
    data,
    warning: _warning || null,
  });
};

export const unlinkIntegration = async (req: Request, res: Response) => {
  const { platform } = req.params;
  await integrationService.unlinkIntegration(req.user!.id, platform as string);
  res.status(200).json({ success: true, data: { message: `Unlinked ${platform}` } });
};

export const syncIntegrations = async (req: Request, res: Response) => {
  const result = await integrationService.syncAllIntegrations(req.user!.id);
  res.status(200).json({ success: true, data: result });
};

export const getHeatmap = async (req: Request, res: Response) => {
  const data = await integrationService.getAggregatedHeatmap(req.user!.id);
  res.status(200).json({ success: true, data });
};
