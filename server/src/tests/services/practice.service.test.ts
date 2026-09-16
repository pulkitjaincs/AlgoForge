import { describe, it, expect, vi, beforeEach } from 'vitest';
import * as practiceService from '../../services/practice.service.js';
import * as reviewService from '../../services/review.service.js';
import * as analyticsService from '../../services/analytics.service.js';
import { questionRepository } from '../../repositories/question.repository.js';

vi.mock('../../services/review.service.js', () => ({
  getReviewQueue: vi.fn(),
}));

vi.mock('../../services/analytics.service.js', () => ({
  getWeakAreas: vi.fn(),
}));

vi.mock('../../repositories/question.repository.js', () => ({
  questionRepository: {
    findWeakQuestions: vi.fn(),
    findRandomUnsolved: vi.fn(),
  },
}));

describe('Practice Service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should get daily plan correctly', async () => {
    (reviewService.getReviewQueue as any).mockResolvedValue([{ id: 'q1' }, { id: 'q2' }]);
    (analyticsService.getWeakAreas as any).mockResolvedValue([{ topicId: 't1' }]);
    (questionRepository.findWeakQuestions as any).mockResolvedValue([{ id: 'q3' }]);
    (questionRepository.findRandomUnsolved as any).mockResolvedValue([{ id: 'q4' }, { id: 'q5' }]);

    const result = await practiceService.getDailyPlan('u1');
    
    expect(result.review.length).toBe(2);
    expect(result.weak.length).toBe(1);
    expect(result.random.length).toBe(2);
  });
});

