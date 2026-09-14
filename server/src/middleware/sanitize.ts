import { Request, Response, NextFunction } from 'express';

const FORBIDDEN_KEYS = new Set(['__proto__', 'constructor', 'prototype']);

// Strips prototype pollution attempts and risky $ operators from request payloads
const sanitizeObject = (obj: any): any => {
  if (typeof obj !== 'object' || obj === null) return obj;
  if (Array.isArray(obj)) return obj.map(sanitizeObject);

  const cleaned: any = {};
  for (const key of Object.keys(obj)) {
    if (key.startsWith('$') || FORBIDDEN_KEYS.has(key)) continue;
    cleaned[key] = sanitizeObject(obj[key]);
  }
  return cleaned;
};

export const sanitize = (req: Request, _res: Response, next: NextFunction) => {
  if (req.body) {
    req.body = sanitizeObject(req.body);
  }
  next();
};
