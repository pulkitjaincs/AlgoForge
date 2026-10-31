import { describe, it, expect, vi, beforeEach } from 'vitest';
import * as reviewService from '../../services/review.service.js';
import { questionRepository } from '../../repositories/question.repository.js';
import { cache } from '../../utils/cache.js';

vi.mock('../../repositories/question.repository.js', () => ({
  questionRepository: {
    findReviewQueue: vi.fn(),
    countReviewQueue: vi.fn(),
  },
}));

describe('Review Service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getReviewStats', () => {
    it('returns cached review stats without querying repository on cache hit', async () => {
      const cachedStats: reviewService.ReviewStats = { dueToday: 5, overdue: 2 };
      (cache.get as any).mockResolvedValue(cachedStats);

      const result = await reviewService.getReviewStats('user-123');

      expect(result).toEqual({ dueToday: 5, overdue: 2 });
      expect(cache.get).toHaveBeenCalledWith('review_stats:user-123');
      expect(questionRepository.countReviewQueue).not.toHaveBeenCalled();
      expect(cache.setWithTag).not.toHaveBeenCalled();
    });

    it('queries repository, caches with tag, and returns ReviewStats on cache miss', async () => {
      (cache.get as any).mockResolvedValue(null);
      (questionRepository.countReviewQueue as any)
        .mockResolvedValueOnce(7)  // dueTodayCount (endOfDay)
        .mockResolvedValueOnce(3);  // overdueCount (now)

      const result = await reviewService.getReviewStats('user-123');

      expect(result).toEqual({ dueToday: 7, overdue: 3 });
      expect(cache.get).toHaveBeenCalledWith('review_stats:user-123');
      expect(questionRepository.countReviewQueue).toHaveBeenCalledTimes(2);

      // Check cache.setWithTag call
      expect(cache.setWithTag).toHaveBeenCalledWith(
        'review_stats:user-123',
        'user:user-123:review',
        { dueToday: 7, overdue: 3 },
        300
      );
    });

    it('handles zero review items accurately', async () => {
      (cache.get as any).mockResolvedValue(null);
      (questionRepository.countReviewQueue as any)
        .mockResolvedValueOnce(0)
        .mockResolvedValueOnce(0);

      const result = await reviewService.getReviewStats('user-zero');

      expect(result).toEqual({ dueToday: 0, overdue: 0 });
      expect(result.dueToday).toBe(0);
      expect(result.overdue).toBe(0);
      expect(cache.setWithTag).toHaveBeenCalledWith(
        'review_stats:user-zero',
        'user:user-zero:review',
        { dueToday: 0, overdue: 0 },
        300
      );
    });
  });

  describe('getReviewQueue', () => {
    it('returns cached queue on cache hit', async () => {
      const mockQueue = [
        { id: 'q1', title: 'Two Sum', difficulty: 'Easy' },
        { id: 'q2', title: 'LRU Cache', difficulty: 'Medium' },
      ];
      (cache.get as any).mockResolvedValue(mockQueue);

      const result = await reviewService.getReviewQueue('user-123');

      expect(result).toEqual(mockQueue);
      expect(cache.get).toHaveBeenCalledWith('review_queue:user-123');
      expect(questionRepository.findReviewQueue).not.toHaveBeenCalled();
    });

    it('queries repository and sets tag on cache miss', async () => {
      const mockQueue = [{ id: 'q1', title: 'Merge Intervals' }];
      (cache.get as any).mockResolvedValue(null);
      (questionRepository.findReviewQueue as any).mockResolvedValue(mockQueue);

      const result = await reviewService.getReviewQueue('user-123');

      expect(result).toEqual(mockQueue);
      expect(questionRepository.findReviewQueue).toHaveBeenCalledWith('user-123', expect.any(Date));
      expect(cache.setWithTag).toHaveBeenCalledWith(
        'review_queue:user-123',
        'user:user-123:review',
        mockQueue,
        300
      );
    });
  });
});
