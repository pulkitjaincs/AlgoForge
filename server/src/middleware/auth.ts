import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';
import { AppError } from '../utils/AppError.js';
import { prisma } from '../config/database.js';
import { cache } from '../utils/cache.js';

export const protect = async (req: Request, _res: Response, next: NextFunction) => {
  const token = req.cookies?.token;
  if (!token) throw new AppError('Not authenticated', 401);

  try {
    const decoded = jwt.verify(token, env.JWT_SECRET) as { userId: string };
    
    // Check cache first
    const cacheKey = `user_session:${decoded.userId}`;
    let user = await cache.get(cacheKey);

    if (!user) {
      user = await prisma.user.findUnique({ where: { id: decoded.userId } });
      if (!user) throw new AppError('User no longer exists', 401);
      // Cache for 60 seconds
      await cache.setWithTag(cacheKey, `user:${decoded.userId}`, user, 60);
    }

    req.user = user as any; // Cast because Date types from Redis might not match exactly, or Prisma models
    next();
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
       throw new AppError('Invalid token', 401);
    }
    throw error;
  }
};
