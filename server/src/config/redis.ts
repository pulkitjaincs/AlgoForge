import Redis from 'ioredis';
import { env } from './env.js';
import { logger } from '../utils/logger.js';

let redis: Redis | null = null;

if (env.REDIS_URL) {
  redis = new Redis(env.REDIS_URL);
  redis.on('connect', () => logger.info('✅ Redis connected'));
  redis.on('error', (err) => logger.error({ err }, '❌ Redis error'));
}

export { redis };
