import { Request, Response } from 'express';
import * as authService from '../services/auth.service.js';

export const register = async (req: Request, res: Response) => {
  const user = await authService.register(req.body);
  const token = authService.generateToken(user.id);
  authService.setAuthCookie(res, token);
  
  res.status(201).json({ success: true, data: user });
};

export const login = async (req: Request, res: Response) => {
  const user = await authService.login(req.body);
  const token = authService.generateToken(user.id);
  authService.setAuthCookie(res, token);

  res.status(200).json({ success: true, data: user });
};

export const logout = async (_req: Request, res: Response) => {
  res.cookie('token', 'none', {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true,
  });
  res.status(200).json({ success: true, data: {} });
};

export const getMe = async (req: Request, res: Response) => {
  res.status(200).json({ success: true, data: (req as any).user });
};
