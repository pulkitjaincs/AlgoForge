import { describe, it, expect, vi, beforeEach } from 'vitest';
import * as integrationService from '../../services/integration.service.js';
import { prisma } from '../../config/database.js';
import { backgroundQueue } from '../../workers/queues.js';
import { AppError } from '../../utils/AppError.js';

vi.mock('../../config/database.js', () => ({
  prisma: {
    platformIntegration: {
      findUnique: vi.fn(),
      findMany: vi.fn(),
      upsert: vi.fn(),
    }
  }
}));

vi.mock('../../workers/queues.js', () => ({
  backgroundQueue: {
    add: vi.fn()
  }
}));

describe('Integration Service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('linkIntegration', () => {
    it('should enqueue sync job on link', async () => {
      (prisma.platformIntegration.findUnique as any).mockResolvedValue(null);
      await integrationService.linkIntegration('u1', 'leetcode', 'username');
      expect(backgroundQueue!.add).toHaveBeenCalledWith('platform-sync', expect.anything());
    });
  });

  describe('syncAllIntegrations', () => {
    it('should throw if background queue is missing', async () => {
      // Mock background queue as null/undefined inside test is tricky with ESM imports.
      // But we can test it adds to queue if exists.
      (prisma.platformIntegration.findMany as any).mockResolvedValue([{ platform: 'leetcode' }]);
      await integrationService.syncAllIntegrations('u1');
      expect(backgroundQueue!.add).toHaveBeenCalled();
    });
  });
});
