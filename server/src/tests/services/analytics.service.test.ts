import { describe, it, expect, vi, beforeEach } from 'vitest';
import { getSummary } from '../../services/analytics.service.js';
import { analyticsRepository } from '../../repositories/analytics.repository.js';
import { cache } from '../../utils/cache.js';

vi.mock('../../repositories/analytics.repository.js', () => ({
  analyticsRepository: {
    getSummaryStats: vi.fn(),
  },
}));

describe('Analytics Service - getSummary', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (cache.get as any).mockResolvedValue(null);
  });

  it('should return zeroed stats if no questions exist', async () => {
    (analyticsRepository.getSummaryStats as any).mockResolvedValue([]);
    const result = await getSummary('user-1');
    expect(result.totalQuestions).toBe(0);
    expect(result.solvedQuestions).toBe(0);
    expect(result.solvedByDifficulty).toEqual({ Easy: 0, Medium: 0, Hard: 0, Basic: 0 });
  });

  it('should aggregate difficulty stats correctly', async () => {
    (analyticsRepository.getSummaryStats as any).mockResolvedValue([
      { difficulty: 'Easy', total: 10, solved: 8 },
      { difficulty: 'Medium', total: 15, solved: 5 },
      { difficulty: 'Hard', total: 5, solved: 1 },
    ]);

    const result = await getSummary('user-1');
    expect(result.totalQuestions).toBe(30);
    expect(result.solvedQuestions).toBe(14);
    expect(result.solvedByDifficulty.Easy).toBe(8);
    expect(result.solvedByDifficulty.Medium).toBe(5);
    expect(result.solvedByDifficulty.Hard).toBe(1);
  });

  it('should return cached result if available', async () => {
    const cachedResult = {
      totalQuestions: 20,
      solvedQuestions: 10,
      difficultyStats: { Easy: 10, Medium: 5, Hard: 5, Basic: 0 },
      solvedByDifficulty: { Easy: 5, Medium: 3, Hard: 2, Basic: 0 },
    };
    (cache.get as any).mockResolvedValue(cachedResult);

    const result = await getSummary('user-1');
    expect(result).toEqual(cachedResult);
    expect(analyticsRepository.getSummaryStats).not.toHaveBeenCalled();
  });
});
