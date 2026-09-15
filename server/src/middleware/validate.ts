import { Request, Response, NextFunction } from 'express';

export const validate = (schema: { parse: (val: unknown) => { body?: unknown; query?: unknown; params?: unknown; [key: string]: unknown } }) => {
  return (req: Request, _res: Response, next: NextFunction) => {
    const parsed = schema.parse({
      body: req.body,
      params: req.params,
      query: req.query,
    });
    if (parsed.body !== undefined) {
      req.body = parsed.body;
    }
    next();
  };
};
