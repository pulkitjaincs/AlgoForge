import { describe, it, expect, vi, beforeEach } from 'vitest';
import { getStreaks } from '../../services/analytics.service.js';
import { analyticsRepository } from '../../repositories/analytics.repository.js';
import { cache } from '../../utils/cache.js';

vi.mock('../../repositories/analytics.repository.js', () => ({
  analyticsRepository: {
    getStreaks: vi.fn(),
  },
}));

describe('Analytics Service - getStreaks', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (cache.get as any).mockResolvedValue(null);
  });

  it('should return 0 streaks if no attempts', async () => {
    (analyticsRepository.getStreaks as any).mockResolvedValue({ current_streak: 0, max_streak: 0, last_active: null });
    const result = await getStreaks('user-1');
    expect(result).toEqual({ currentStreak: 0, maxStreak: 0, lastActive: null });
  });

  it('should calculate current and max streak correctly with consecutive dates', async () => {
    const today = new Date();
    (analyticsRepository.getStreaks as any).mockResolvedValue({
      current_streak: 3,
      max_streak: 3,
      last_active: today
    });

    const result = await getStreaks('user-1');
    expect(result.currentStreak).toBe(3);
    expect(result.maxStreak).toBe(3);
    expect(result.lastActive).toEqual(today);
  });

  it('should break current streak if inactive today and yesterday', async () => {
    const today = new Date();
    const twoDaysAgo = new Date(today);
    twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);
    
    (analyticsRepository.getStreaks as any).mockResolvedValue({
      current_streak: 0,
      max_streak: 2,
      last_active: twoDaysAgo
    });

    const result = await getStreaks('user-1');
    expect(result.currentStreak).toBe(0);
    expect(result.maxStreak).toBe(2);
    expect(result.lastActive).toEqual(twoDaysAgo);
  });

  it('should calculate max streak accurately across gaps', async () => {
    (analyticsRepository.getStreaks as any).mockResolvedValue({
      current_streak: 0,
      max_streak: 3,
      last_active: new Date('2026-09-10T10:00:00Z')
    });

    const result = await getStreaks('user-1');
    expect(result.currentStreak).toBe(0); // Assuming today is NOT Sep 10 or 11
    expect(result.maxStreak).toBe(3); // Sep 8-10 is the max
  });
});
