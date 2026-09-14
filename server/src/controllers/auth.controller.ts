import { Request, Response } from 'express';
import crypto from 'crypto';
import * as authService from '../services/auth.service.js';
import { tokenRepository } from '../repositories/token.repository.js';

const getClientMeta = (req: Request) => ({
  deviceInfo: (req.headers['user-agent'] || '').slice(0, 255),
  ipAddress: (req.ip || req.socket.remoteAddress || '').slice(0, 45),
});

export const register = async (req: Request, res: Response) => {
  const user = await authService.register(req.body);
  const { accessToken, refreshToken } = await authService.generateTokens(user.id, undefined, getClientMeta(req));
  authService.setAuthCookies(res, accessToken, refreshToken);
  
  res.status(201).json({ success: true, data: user });
};

export const login = async (req: Request, res: Response) => {
  const user = await authService.login(req.body);
  const { accessToken, refreshToken } = await authService.generateTokens(user.id, undefined, getClientMeta(req));
  authService.setAuthCookies(res, accessToken, refreshToken);

  res.status(200).json({ success: true, data: user });
};

export const refresh = async (req: Request, res: Response) => {
  const { refreshToken } = req.cookies;
  if (!refreshToken) {
    res.status(401).json({ success: false, error: 'No refresh token provided' });
    return;
  }

  const tokens = await authService.refreshAccess(refreshToken, getClientMeta(req));
  authService.setAuthCookies(res, tokens.accessToken, tokens.refreshToken);

  res.status(200).json({ success: true, data: {} });
};

export const logout = async (req: Request, res: Response) => {
  const { refreshToken } = req.cookies;
  if (refreshToken) {
    const hashedToken = crypto.createHash('sha256').update(refreshToken).digest('hex');
    tokenRepository.delete(hashedToken).catch(() => {});
  }
  authService.clearAuthCookies(res);
  res.status(200).json({ success: true, data: {} });
};

export const getMe = async (req: Request, res: Response) => {
  res.status(200).json({ success: true, data: req.user! });
};
