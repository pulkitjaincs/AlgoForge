import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';
import { AppError } from '../utils/AppError.js';
import { prisma } from '../config/database.js';

export const protect = async (req: Request, _res: Response, next: NextFunction) => {
  const token = req.cookies?.token;
  if (!token) throw new AppError('Not authenticated', 401);

  try {
    const decoded = jwt.verify(token, env.JWT_SECRET) as { userId: string };
    const user = await prisma.user.findUnique({ where: { id: decoded.userId } });
    if (!user) throw new AppError('User no longer exists', 401);

    req.user = user;
    next();
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
       throw new AppError('Invalid token', 401);
    }
    throw error;
  }
};
