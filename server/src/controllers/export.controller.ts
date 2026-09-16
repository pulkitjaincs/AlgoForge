import { Request, Response } from 'express';
import { backgroundQueue } from '../workers/queues.js';
import { cache } from '../utils/cache.js';
import { AppError } from '../utils/AppError.js';

export const requestExport = async (req: Request, res: Response) => {
  if (!backgroundQueue) {
    throw new AppError('Background processing unavailable', 503);
  }

  await backgroundQueue.add('data-export', { userId: req.user!.id }, {
    attempts: 3,
    backoff: { type: 'exponential', delay: 1000 }
  });

  res.status(202).json({ success: true, message: 'Export generation started in background' });
};

export const downloadExport = async (req: Request, res: Response) => {
  const cacheKey = `export:${req.user!.id}`;
  const data = await cache.get(cacheKey);

  if (!data) {
    throw new AppError('Export not found or expired', 404);
  }

  res.setHeader('Content-Disposition', 'attachment; filename=algoforge-export.json');
  res.setHeader('Content-Type', 'application/json');
  res.status(200).send(JSON.stringify(data, null, 2));
};
