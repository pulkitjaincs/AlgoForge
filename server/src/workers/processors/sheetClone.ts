import { Job } from 'bullmq';
import { logger } from '../../utils/logger.js';

export const processSheetClone = async (job: Job) => {
  const { userId, sheetId } = job.data;
  logger.info(`Starting sheet clone for user ${userId}, sheet ${sheetId}`);
  // To be implemented in Phase 5.1
  return { success: true };
};
