import { doubleCsrf } from 'csrf-csrf';
import { env } from './env.js';
import { Request } from 'express';

export const {
  generateCsrfToken: generateToken,
  doubleCsrfProtection,
} = doubleCsrf({
  getSecret: () => env.JWT_SECRET,
  getSessionIdentifier: (req: Request) => req.cookies?.['accessToken'] || 'default',
  cookieName: 'x-csrf-token',
  cookieOptions: {
    sameSite: 'lax',
    path: '/',
    secure: env.NODE_ENV === 'production',
  },
  size: 64,
  ignoredMethods: ['GET', 'HEAD', 'OPTIONS'],
  getCsrfTokenFromRequest: (req: Request) => req.headers['x-csrf-token'] as string,
});
