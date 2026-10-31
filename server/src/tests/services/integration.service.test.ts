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
      update: vi.fn().mockResolvedValue({ id: 'int1', platform: 'leetcode', solvedCount: 10 }),
      delete: vi.fn(),
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
    it('should sync user platforms and return updated stats', async () => {
      (prisma.platformIntegration.findMany as any).mockResolvedValue([
        { id: 'int1', platform: 'leetcode', username: 'tourist', lastSyncedAt: new Date(0), solvedCount: 0, rating: 0, maxRating: 0, contributions: 0 }
      ]);
      const result = await integrationService.syncAllIntegrations('u1');
      expect(result.integrations).toBeDefined();
    });
  });

  describe('syncUserPlatformsDirect rate limit & caching', () => {
    it('should throw 429 when sync attempted within 1 hour of previous sync', async () => {
      const recentDate = new Date(Date.now() - 10 * 60 * 1000); // 10 minutes ago
      (prisma.platformIntegration.findMany as any).mockResolvedValue([
        {
          id: 'int1',
          platform: 'leetcode',
          username: 'tourist',
          lastSyncedAt: recentDate,
          solvedCount: 50,
          rating: 1500,
          maxRating: 1500,
          contributions: 5,
        },
      ]);

      await expect(integrationService.syncUserPlatformsDirect('u1')).rejects.toThrow('You can only sync integrations once every 1 hour.');
    });
  });

  describe('unlinkIntegration', () => {
    it('should delete integration and invalidate integrations, analytics, and profile cache tags', async () => {
      const { cache } = await import('../../utils/cache.js');
      (prisma.platformIntegration.delete as any).mockResolvedValue({});

      await integrationService.unlinkIntegration('u1', 'leetcode');

      expect(cache.invalidateTag).toHaveBeenCalledWith('user:u1:integrations');
      expect(cache.invalidateTag).toHaveBeenCalledWith('user:u1:analytics');
      expect(cache.invalidateTag).toHaveBeenCalledWith('user:u1:profile');
    });
  });
});
