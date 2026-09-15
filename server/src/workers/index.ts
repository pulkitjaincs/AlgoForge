import { Worker } from 'bullmq';
import { env } from '../config/env.js';
import { logger } from '../utils/logger.js';
import { processPlatformSync } from '../workers/processors/platformSync.js';
import { processSheetClone } from '../workers/processors/sheetClone.js';
import { processDataExport } from '../workers/processors/dataExport.js';
import { processTrashPurge } from '../workers/processors/trashPurge.js';
import { processTokenCleanup } from '../workers/processors/tokenCleanup.js';
import { backgroundQueue } from '../workers/queues.js';

let worker: Worker | null = null;

const jobRegistry: Record<string, (job: any) => Promise<any>> = {
  'platform-sync': processPlatformSync,
  'sheet-clone': processSheetClone,
  'data-export': processDataExport,
  'trash-purge': processTrashPurge,
  'token-cleanup': processTokenCleanup,
};

if (env.REDIS_URL) {
  worker = new Worker('algoforge-jobs', async (job) => {
    const handler = jobRegistry[job.name];
    if (handler) {
      return handler(job);
    }
    throw new Error(`Unknown job name: ${job.name}`);
  }, {
    connection: { url: env.REDIS_URL },
    concurrency: 5
  });

  worker.on('completed', (job) => {
    logger.info(`Job ${job.id} (${job.name}) completed successfully`);
  });

  worker.on('failed', (job, err) => {
    logger.error({ err }, `Job ${job?.id} (${job?.name}) failed`);
  });

  // Schedule repeatable jobs
  if (backgroundQueue) {
    backgroundQueue.upsertJobScheduler('trash-purge', { pattern: '0 3 * * *' }, {
      name: 'trash-purge'
    }).catch(err => logger.error({ err }, 'Failed to schedule trash-purge'));

    backgroundQueue.upsertJobScheduler('token-cleanup', { pattern: '0 4 * * *' }, {
      name: 'token-cleanup'
    }).catch(err => logger.error({ err }, 'Failed to schedule token-cleanup'));
  }
} else {
  logger.warn('REDIS_URL not provided. Background workers are disabled.');
}

export { worker };
