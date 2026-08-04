import rateLimit from 'express-rate-limit';

export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20, // 20 requests per window
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, error: 'Too many authentication attempts, please try again later' },
});

export const syncLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 1, // 1 sync per hour
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, error: 'Integration sync rate limit exceeded (max 1 per 1 hour)' },
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
