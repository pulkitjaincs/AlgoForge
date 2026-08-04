import { redis } from '../config/redis.js';
import { logger } from './logger.js';

export const cache = {
  async get<T>(key: string): Promise<T | null> {
    if (!redis) return null;
    try {
      const data = await redis.get(key);
      return data ? JSON.parse(data) : null;
    } catch (err) {
      logger.error({ err, key }, 'Redis GET error');
      return null;
    }
  },

  async set(key: string, data: unknown, ttlSeconds: number = 300): Promise<void> {
    if (!redis) return;
    try {
      await redis.set(key, JSON.stringify(data), 'EX', ttlSeconds);
    } catch (err) {
      logger.error({ err, key }, 'Redis SET error');
    }
  },

  async invalidate(...keys: string[]): Promise<void> {
    if (!redis || keys.length === 0) return;
    try {
      await redis.del(...keys);
    } catch (err) {
      logger.error({ err, keys }, 'Redis DEL error');
    }
  },

  async setWithTag(key: string, tag: string, data: unknown, ttlSeconds: number = 300): Promise<void> {
    if (!redis) return;
    try {
      await redis.set(key, JSON.stringify(data), 'EX', ttlSeconds);
      const tagKey = `tag:${tag}`;
      await redis.sadd(tagKey, key);
      await redis.expire(tagKey, ttlSeconds);
    } catch (err) {
      logger.error({ err, key, tag }, 'Redis setWithTag error');
    }
  },

  async invalidateTag(tag: string): Promise<void> {
    if (!redis) return;
    try {
      const tagKey = `tag:${tag}`;
      const keys = await redis.smembers(tagKey);
      if (keys.length > 0) {
        await redis.del(...keys, tagKey);
      } else {
        await redis.del(tagKey);
      }
    } catch (err) {
      logger.error({ err, tag }, 'Redis invalidateTag error');
    }
  },
};
