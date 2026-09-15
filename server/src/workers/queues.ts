import { Queue } from 'bullmq';
import { env } from '../config/env.js';

export const backgroundQueue = env.REDIS_URL 
  ? new Queue('algoforge-jobs', {
      connection: { url: env.REDIS_URL }
    })
  : null;
