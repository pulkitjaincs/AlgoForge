import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';
import { AppError } from '../utils/AppError.js';
import { Response } from 'express';
import { RegisterInput, LoginInput } from '@algoforge/shared';
import { userRepository } from '../repositories/user.repository.js';
import { tokenRepository } from '../repositories/token.repository.js';

export const register = async (data: RegisterInput) => {
  const existingUser = await userRepository.findByEmail(data.email);
  if (existingUser) {
    throw new AppError('Email already in use', 400);
  }

  const hashedPassword = await bcrypt.hash(data.password, 12);
  const user = await userRepository.create({
    name: data.name,
    email: data.email,
    password: hashedPassword,
  });

  return user;
};

export const login = async (data: LoginInput) => {
  const user = await userRepository.findByEmail(data.email);
  if (!user) {
    throw new AppError('Invalid credentials', 401);
  }

  const isMatch = await bcrypt.compare(data.password, user.password);
  if (!isMatch) {
    throw new AppError('Invalid credentials', 401);
  }

  // Fire and forget cleanup of expired tokens
  tokenRepository.deleteExpiredTokens().catch(() => {});

  return { id: user.id, name: user.name, email: user.email };
};

export const generateTokens = async (userId: string) => {
  const accessToken = jwt.sign({ userId }, env.JWT_SECRET, { expiresIn: '15m' });
  
  const refreshTokenString = crypto.randomBytes(40).toString('hex');
  const hashedToken = crypto.createHash('sha256').update(refreshTokenString).digest('hex');
  
  await tokenRepository.createRefreshToken(userId, hashedToken, 7); // 7 days expiry

  return { accessToken, refreshToken: refreshTokenString };
};

export const refreshAccess = async (refreshToken: string) => {
  const hashedToken = crypto.createHash('sha256').update(refreshToken).digest('hex');
  const tokenRecord = await tokenRepository.findByToken(hashedToken);
  
  if (!tokenRecord) {
    throw new AppError('Invalid refresh token', 401);
  }

  if (tokenRecord.expiresAt < new Date()) {
    await tokenRepository.delete(hashedToken);
    throw new AppError('Refresh token expired', 401);
  }

  // Rotate token
  await tokenRepository.delete(hashedToken);
  return generateTokens(tokenRecord.userId);
};

export const setAuthCookies = (res: Response, accessToken: string, refreshToken: string) => {
  res.cookie('token', accessToken, {
    httpOnly: true,
    secure: env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 15 * 60 * 1000, // 15 mins
  });

  res.cookie('refreshToken', refreshToken, {
    httpOnly: true,
    secure: env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  });
};

export const clearAuthCookies = (res: Response) => {
  res.clearCookie('token');
  res.clearCookie('refreshToken');
};
