import { describe, it, expect, vi, beforeEach } from 'vitest';
import * as contestService from '../../services/contest.service.js';
import { cache } from '../../utils/cache.js';

describe('Contest Service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('fetches upcoming contests and sorts them chronologically', async () => {
    const contests = await contestService.getUpcomingContests();

    expect(Array.isArray(contests)).toBe(true);
    expect(contests.length).toBeGreaterThan(0);

    // Verify properties
    const first = contests[0];
    expect(first).toHaveProperty('id');
    expect(first).toHaveProperty('title');
    expect(first).toHaveProperty('platform');
    expect(first).toHaveProperty('url');
    expect(first).toHaveProperty('startTime');
    expect(first).toHaveProperty('durationSeconds');
    expect(first).toHaveProperty('status');

    // Chronological ordering check
    for (let i = 1; i < contests.length; i++) {
      const prevTime = new Date(contests[i - 1].startTime).getTime();
      const currTime = new Date(contests[i].startTime).getTime();
      expect(currTime).toBeGreaterThanOrEqual(prevTime);
    }
  });

  it('filters contests by platform correctly', async () => {
    const atcoderOnly = await contestService.getUpcomingContests('atcoder');
    expect(atcoderOnly.length).toBeGreaterThan(0);
    expect(atcoderOnly.every((c) => c.platform === 'atcoder')).toBe(true);

    const codechefOnly = await contestService.getUpcomingContests('codechef');
    expect(codechefOnly.length).toBeGreaterThan(0);
    expect(codechefOnly.every((c) => c.platform === 'codechef')).toBe(true);
  });

  it('fetches user contest ratings excluding github', async () => {
    const { prisma } = await import('../../config/database.js');
    const mockIntegrations = [
      {
        platform: 'leetcode',
        username: 'coder1',
        rating: 1850,
        maxRating: 1900,
        tier: 'Knight',
        lastSyncedAt: new Date(),
      },
    ];
    vi.mocked(prisma.platformIntegration.findMany).mockResolvedValue(mockIntegrations as any);

    const ratings = await contestService.getUserContestRatings('user-123');

    expect(prisma.platformIntegration.findMany).toHaveBeenCalledWith({
      where: {
        userId: 'user-123',
        platform: {
          not: 'github',
        },
      },
      select: {
        platform: true,
        username: true,
        rating: true,
        maxRating: true,
        tier: true,
        lastSyncedAt: true,
      },
    });
    expect(ratings).toHaveLength(1);
    expect(ratings[0].platform).toBe('leetcode');
  });
});

