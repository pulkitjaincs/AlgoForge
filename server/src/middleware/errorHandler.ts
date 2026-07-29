import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import { AppError } from '../utils/AppError.js';
import { logger } from '../utils/logger.js';

export const errorHandler = (err: any, req: Request, res: Response, _next: NextFunction) => {
  // AppError — known, operational
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({ success: false, error: err.message });
  }

  // Zod validation failure
  if (err instanceof ZodError) {
    if (process.env.NODE_ENV === 'test') {
      console.error('ERROR:', err);
    }
    const message = err.issues.map(i => `${i.path.join('.')}: ${i.message}`).join(', ');
    return res.status(400).json({ success: false, error: message });
  }

  // Prisma Errors (simplified for now as we transition)
  if (err.code === 'P2002') {
    return res.status(409).json({ success: false, error: 'Duplicate value detected' });
  }
  if (err.code === 'P2025') {
    return res.status(404).json({ success: false, error: 'Record not found' });
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({ success: false, error: 'Invalid token' });
  }
  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({ success: false, error: 'Token expired' });
  }

  // Unknown — NEVER leak error.message in production
  logger.error({ err, requestId: (req as any).id }, 'Unhandled error');
  if (process.env.NODE_ENV === 'test') {
    console.error('UNHANDLED ERROR:', err);
  }
  return res.status(500).json({ success: false, error: 'Internal server error' });
};
