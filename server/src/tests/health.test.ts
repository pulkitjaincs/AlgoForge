import request from 'supertest';
import app from '../app.js';
import { describe, it, expect } from 'vitest';

describe('Health Endpoint', () => {
  it('should return 200 and healthy status', async () => {
    const res = await request(app).get('/api/v1/health');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.status).toBe('healthy');
    expect(res.body.data.timestamp).toBeDefined();
  });
});
