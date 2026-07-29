import request from 'supertest';
import express, { Request, Response, NextFunction } from 'express';
import { errorHandler } from '../middleware/errorHandler.js';
import { AppError } from '../utils/AppError.js';
import { ZodError, z } from 'zod';
import jwt from 'jsonwebtoken';
import { describe, it, expect } from 'vitest';

const app = express();

app.get('/app-error', () => {
  throw new AppError('Custom Error', 400);
});

app.get('/zod-error', () => {
  const schema = z.object({ name: z.string() });
  schema.parse({ name: 123 }); // Throws ZodError
});

app.get('/prisma-duplicate', () => {
  const err: any = new Error('Prisma Error');
  err.code = 'P2002';
  throw err;
});

app.get('/jwt-error', () => {
  throw new jwt.JsonWebTokenError('invalid signature');
});

app.get('/unknown-error', () => {
  throw new Error('Something terrible happened');
});

// Setup handler at the end
app.use(errorHandler);

describe('Global Error Handler', () => {
  it('handles AppError', async () => {
    const res = await request(app).get('/app-error');
    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.error).toBe('Custom Error');
  });

  it('handles ZodError', async () => {
    const res = await request(app).get('/zod-error');
    expect(res.status).toBe(400);
    expect(res.body.error.toLowerCase()).toContain('expected string, received number');
  });

  it('handles Prisma duplicate key (P2002)', async () => {
    const res = await request(app).get('/prisma-duplicate');
    expect(res.status).toBe(409);
    expect(res.body.error).toBe('Duplicate value detected');
  });

  it('handles JWT errors', async () => {
    const res = await request(app).get('/jwt-error');
    expect(res.status).toBe(401);
    expect(res.body.error).toBe('Invalid token');
  });

  it('hides unknown errors', async () => {
    const res = await request(app).get('/unknown-error');
    expect(res.status).toBe(500);
    expect(res.body.error).toBe('Internal server error'); // Does NOT leak 'Something terrible happened'
  });
});
