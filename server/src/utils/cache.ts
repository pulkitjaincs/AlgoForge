import { redis } from '../config/redis.js';
import { logger } from './logger.js';
import zlib from 'zlib';
import { promisify } from 'util';

const compress = promisify(zlib.brotliCompress);
const decompress = promisify(zlib.brotliDecompress);

export const cache = {
  async get<T>(key: string): Promise<T | null> {
    if (!redis) return null;
    try {
      const data = await redis.getBuffer(key);
      if (!data) return null;
      const decompressed = await decompress(data);
      return JSON.parse(decompressed.toString('utf-8'));
    } catch (err) {
      logger.error({ err, key }, 'Redis GET error');
      return null;
    }
  },

  async set(key: string, data: unknown, ttlSeconds: number = 300): Promise<void> {
    if (!redis) return;
    try {
      const compressed = await compress(JSON.stringify(data));
      await redis.set(key, compressed, 'EX', ttlSeconds);
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
      const compressed = await compress(JSON.stringify(data));
      await redis.set(key, compressed, 'EX', ttlSeconds);
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

  async invalidatePattern(pattern: string): Promise<void> {
    if (!redis) return;
    try {
      let cursor = '0';
      const keysToDelete: string[] = [];
      do {
        const [nextCursor, keys] = await redis.scan(cursor, 'MATCH', pattern, 'COUNT', 100);
        cursor = nextCursor;
        if (keys.length > 0) {
          keysToDelete.push(...keys);
        }
      } while (cursor !== '0');
      
      if (keysToDelete.length > 0) {
        await redis.del(...keysToDelete);
      }
    } catch (err) {
      logger.error({ err, pattern }, 'Redis invalidatePattern error');
    }
  },

  async getOrSet<T>(key: string, fetchFn: () => Promise<T>, ttlSeconds: number = 300): Promise<T> {
    const cached = await this.get<T>(key);
    if (cached !== null) return cached;
    const fresh = await fetchFn();
    await this.set(key, fresh, ttlSeconds);
    return fresh;
  },
};
