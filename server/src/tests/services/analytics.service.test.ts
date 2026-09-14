import { describe, it, expect, vi, beforeEach } from 'vitest';
import { getStreaks } from '../../services/analytics.service.js';
import { attemptRepository } from '../../repositories/attempt.repository.js';
import { cache } from '../../utils/cache.js';

vi.mock('../../repositories/attempt.repository.js', () => ({
  attemptRepository: {
    findAttempts: vi.fn(),
  },
}));

describe('Analytics Service - getStreaks', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (cache.get as any).mockResolvedValue(null);
  });

  it('should return 0 streaks if no attempts', async () => {
    (attemptRepository.findAttempts as any).mockResolvedValue([]);
    const result = await getStreaks('user-1');
    expect(result).toEqual({ currentStreak: 0, maxStreak: 0, lastActive: null });
  });

  it('should calculate current and max streak correctly with consecutive dates', async () => {
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const dayBefore = new Date(today);
    dayBefore.setDate(dayBefore.getDate() - 2);

    (attemptRepository.findAttempts as any).mockResolvedValue([
      { solvedAt: today },
      { solvedAt: yesterday },
      { solvedAt: dayBefore }
    ]);

    const result = await getStreaks('user-1');
    expect(result.currentStreak).toBe(3);
    expect(result.maxStreak).toBe(3);
    expect(result.lastActive).toEqual(today);
  });

  it('should break current streak if inactive today and yesterday', async () => {
    const today = new Date();
    const twoDaysAgo = new Date(today);
    twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);
    const threeDaysAgo = new Date(today);
    threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);

    (attemptRepository.findAttempts as any).mockResolvedValue([
      { solvedAt: twoDaysAgo },
      { solvedAt: threeDaysAgo }
    ]);

    const result = await getStreaks('user-1');
    expect(result.currentStreak).toBe(0);
    expect(result.maxStreak).toBe(2);
    expect(result.lastActive).toEqual(twoDaysAgo);
  });

  it('should calculate max streak accurately across gaps', async () => {
    const dates = [
      new Date('2026-09-10T10:00:00Z'),
      new Date('2026-09-09T10:00:00Z'),
      new Date('2026-09-08T10:00:00Z'),
      new Date('2026-09-05T10:00:00Z'),
      new Date('2026-09-04T10:00:00Z'),
      new Date('2026-09-01T10:00:00Z'),
    ];

    (attemptRepository.findAttempts as any).mockResolvedValue(
      dates.map(d => ({ solvedAt: d }))
    );

    const result = await getStreaks('user-1');
    expect(result.currentStreak).toBe(0); // Assuming today is NOT Sep 10 or 11
    expect(result.maxStreak).toBe(3); // Sep 8-10 is the max
  });
});
