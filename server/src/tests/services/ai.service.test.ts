import { describe, it, expect, vi, beforeEach } from 'vitest';
import * as aiService from '../../services/ai.service.js';
import * as analyticsService from '../../services/analytics.service.js';
import * as reviewService from '../../services/review.service.js';
import * as practiceService from '../../services/practice.service.js';
import * as contestService from '../../services/contest.service.js';
import * as questionService from '../../services/question.service.js';
import { cache } from '../../utils/cache.js';

vi.mock('../../utils/cache.js', () => ({
  cache: {
    get: vi.fn(),
    set: vi.fn(),
    setWithTag: vi.fn(),
    invalidateTag: vi.fn(),
  },
}));

vi.mock('../../services/analytics.service.js', () => ({
  getWeakAreas: vi.fn(),
  getTopicMastery: vi.fn(),
}));

vi.mock('../../services/review.service.js', () => ({
  getReviewStats: vi.fn(),
}));

vi.mock('../../services/practice.service.js', () => ({
  getDailyPlan: vi.fn(),
}));

vi.mock('../../services/contest.service.js', () => ({
  getUpcomingContests: vi.fn(),
}));

vi.mock('../../services/question.service.js', () => ({
  getQuestionById: vi.fn(),
}));

describe('AI Service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getAICoachPlan', () => {
    it('should generate intelligent heuristic coach plan when cache empty', async () => {
      (cache.get as any).mockResolvedValue(null);
      (analyticsService.getWeakAreas as any).mockResolvedValue([
        { topicId: 't1', title: 'Dynamic Programming', percentage: 25, total: 8, solved: 2 }
      ]);
      (analyticsService.getTopicMastery as any).mockResolvedValue([]);
      (reviewService.getReviewStats as any).mockResolvedValue({ dueToday: 3, overdue: 1 });
      (practiceService.getDailyPlan as any).mockResolvedValue({
        review: [],
        weak: [],
        random: [{ id: 'q1', title: 'Reverse Linked List', difficulty: 'Easy' }]
      });
      (contestService.getUpcomingContests as any).mockResolvedValue([]);

      const plan = await aiService.getAICoachPlan('u1');

      expect(plan).toBeDefined();
      expect(plan.headline).toContain('Dynamic Programming');
      expect(plan.recommendations.length).toBeGreaterThan(0);
      expect(cache.setWithTag).toHaveBeenCalledWith(
        'ai_coach_plan:u1',
        'user:u1:analytics',
        expect.anything(),
        86400
      );
    });

    it('should flag upcoming contests within 48h in study plan', async () => {
      (cache.get as any).mockResolvedValue(null);
      (analyticsService.getWeakAreas as any).mockResolvedValue([]);
      (analyticsService.getTopicMastery as any).mockResolvedValue([]);
      (reviewService.getReviewStats as any).mockResolvedValue({ dueToday: 0, overdue: 0 });
      (practiceService.getDailyPlan as any).mockResolvedValue({ review: [], weak: [], random: [] });
      
      const contestTime = new Date(Date.now() + 12 * 3600 * 1000).toISOString();
      (contestService.getUpcomingContests as any).mockResolvedValue([
        {
          id: 'cf-1',
          title: 'Codeforces Round 990 (Div. 2)',
          platform: 'codeforces',
          startTime: contestTime,
          durationSeconds: 7200,
          status: 'UPCOMING'
        }
      ]);

      const plan = await aiService.getAICoachPlan('u1');

      expect(plan.contestAlert).toBeDefined();
      expect(plan.contestAlert?.platform).toBe('codeforces');
      expect(plan.headline).toContain('Contest');
    });

    it('should throw 429 AppError when forceRefresh requested during active cooldown', async () => {
      (cache.get as any).mockImplementation(async (key: string) => {
        if (key === 'ai_coach_cooldown:u1') return true;
        return null;
      });

      await expect(aiService.getAICoachPlan('u1', true)).rejects.toThrow('AI Coach plan can only be manually refreshed once per hour.');
    });

    it('should set 1-hour cooldown key and 24-hour cache when forceRefresh succeeds', async () => {
      (cache.get as any).mockImplementation(async (key: string) => {
        if (key === 'ai_coach_cooldown:u1') return false;
        return null;
      });
      (analyticsService.getWeakAreas as any).mockResolvedValue([]);
      (analyticsService.getTopicMastery as any).mockResolvedValue([]);
      (reviewService.getReviewStats as any).mockResolvedValue({ dueToday: 0, overdue: 0 });
      (practiceService.getDailyPlan as any).mockResolvedValue({ review: [], weak: [], random: [] });
      (contestService.getUpcomingContests as any).mockResolvedValue([]);

      await aiService.getAICoachPlan('u1', true);

      expect(cache.set).toHaveBeenCalledWith('ai_coach_cooldown:u1', true, 3600);
      expect(cache.setWithTag).toHaveBeenCalledWith('ai_coach_plan:u1', 'user:u1:analytics', expect.anything(), 86400);
    });

    it('should return cached plan on normal request without setting cooldown', async () => {
      const mockCachedPlan = { headline: 'Cached Plan', analysis: 'Cached', targetMinutes: 60, recommendations: [], motivationalTip: 'Keep it up' };
      (cache.get as any).mockImplementation(async (key: string) => {
        if (key === 'ai_coach_plan:u1') return mockCachedPlan;
        return null;
      });

      const plan = await aiService.getAICoachPlan('u1', false);

      expect(plan).toEqual(mockCachedPlan);
      expect(cache.set).not.toHaveBeenCalled();
    });
  });

  describe('getSocraticHint', () => {
    it('should provide Level 1 conceptual guidance without leaking solution', async () => {
      (questionService.getQuestionById as any).mockResolvedValue({
        id: 'q1',
        title: 'Two Sum',
        difficulty: 'Easy',
        platform: 'leetcode'
      });

      const hint = await aiService.getSocraticHint('u1', 'q1', 1);

      expect(hint.hintLevel).toBe(1);
      expect(hint.levelName).toBe('conceptual');
      expect(hint.guidance).toBeDefined();
      expect(hint.guidance).not.toContain('class Solution');
      expect(hint.thoughtPrompt).toBeDefined();
    });

    it('should provide Level 3 counter example guidance', async () => {
      (questionService.getQuestionById as any).mockResolvedValue({
        id: 'q1',
        title: 'Longest Substring Without Repeating Characters',
        difficulty: 'Medium',
        platform: 'leetcode'
      });

      const hint = await aiService.getSocraticHint('u1', 'q1', 3);

      expect(hint.hintLevel).toBe(3);
      expect(hint.levelName).toBe('counter_example');
      expect(hint.counterExample).toBeDefined();
    });
  });
});
