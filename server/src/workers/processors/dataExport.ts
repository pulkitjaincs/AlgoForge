import { Job } from 'bullmq';
import { logger } from '../../utils/logger.js';

export const processDataExport = async (job: Job) => {
  const { userId } = job.data;
  logger.info(`Starting data export for user ${userId}`);
  // To be implemented in Phase 5.3
  return { success: true };
};
