import { redis } from '../config/redis.js';

export const cache = {
  async get<T>(key: string): Promise<T | null> {
    if (!redis) return null;
    try {
      const data = await redis.get(key);
      return data ? JSON.parse(data) : null;
    } catch (err) {
      return null;
    }
  },

  async set(key: string, data: unknown, ttlSeconds: number = 300): Promise<void> {
    if (!redis) return;
    try {
      await redis.set(key, JSON.stringify(data), 'EX', ttlSeconds);
    } catch (err) {
      // Ignore cache errors to gracefully degrade
    }
  },

  async invalidate(...keys: string[]): Promise<void> {
    if (!redis || keys.length === 0) return;
    try {
      await redis.del(...keys);
    } catch (err) {
      // Ignore
    }
  },

  async setWithTag(key: string, tag: string, data: unknown, ttlSeconds: number = 300): Promise<void> {
    if (!redis) return;
    try {
      await redis.set(key, JSON.stringify(data), 'EX', ttlSeconds);
      await redis.sadd(`tag:${tag}`, key);
    } catch (err) {}
  },

  async invalidateTag(tag: string): Promise<void> {
    if (!redis) return;
    try {
      const keys = await redis.smembers(`tag:${tag}`);
      if (keys.length > 0) {
        await redis.del(...keys, `tag:${tag}`);
      }
    } catch (err) {}
  },
};
