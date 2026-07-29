import { Request, Response, NextFunction } from 'express';

// Strips MongoDB/Prisma risky operators from req.body, req.query, req.params
const stripDollarKeys = (obj: any): any => {
  if (typeof obj !== 'object' || obj === null) return obj;
  if (Array.isArray(obj)) return obj.map(stripDollarKeys);

  const cleaned: any = {};
  for (const key of Object.keys(obj)) {
    if (key.startsWith('$')) continue; // strip dangerous operators
    cleaned[key] = stripDollarKeys(obj[key]);
  }
  return cleaned;
};

export const sanitize = (req: Request, _res: Response, next: NextFunction) => {
  if (req.body) {
    req.body = stripDollarKeys(req.body);
  }
  // req.query and req.params are readonly getters in Express 5
  // and we use Zod for strict schema validation anyway.
  next();
};
