import rateLimit, { ipKeyGenerator } from 'express-rate-limit';

// Strict login limiter: max 10 failed attempts per 15 min per IP/email
export const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, error: 'Too many failed login attempts. Please try again after 15 minutes.' },
  keyGenerator: (req: any, res: any) => (req.body?.email ? `login:${req.body.email.toLowerCase()}` : ipKeyGenerator(req, res)),
  skipSuccessfulRequests: true,
});

// Stricter registration limiter: max 5 accounts created per 15 min per IP
export const registerLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, error: 'Too many accounts registered from this IP. Please try again later.' },
});

// Refresh limiter: max 30 refreshes per 15 min per IP
export const refreshLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, error: 'Too many token refresh attempts. Please re-authenticate.' },
});

// General auth limiter
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, error: 'Too many authentication attempts, please try again later' },
});

// Integration sync limiter: per-user (falls back to IP), max 1 per 1 hour
export const syncLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 1,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, error: 'Integration sync rate limit exceeded (max 1 per hour)' },
  keyGenerator: (req: any, res: any) => (req.user?.id ? `user-sync:${req.user.id}` : ipKeyGenerator(req, res)),
});

// Public profile anti-scraping limiter: max 60 requests per 15 min per IP
export const publicProfileLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 60,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, error: 'Profile viewing rate limit exceeded. Please try again later.' },
});

export const publishLimiter = rateLimit({
  windowMs: 24 * 60 * 60 * 1000, // 1 day
  max: 5, // 5 publishes per day
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, error: 'Publish rate limit exceeded (max 5 per day)' },
});

export const analyticsLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // 100 requests per 15 minutes
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, error: 'Analytics rate limit exceeded' },
});
