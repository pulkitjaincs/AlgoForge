import { describe, it, expect, vi, beforeEach } from 'vitest';
import * as questionService from '../../services/question.service.js';
import { questionRepository } from '../../repositories/question.repository.js';
import { topicRepository } from '../../repositories/topic.repository.js';
import { cache } from '../../utils/cache.js';
import { AppError } from '../../utils/AppError.js';

vi.mock('../../repositories/question.repository.js', () => ({
  questionRepository: {
    findFirstWithRelations: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    softDelete: vi.fn(),
    addAttemptTransaction: vi.fn(),
    reorder: vi.fn(),
    countByTopicOrSubTopic: vi.fn(),
  },
}));

vi.mock('../../repositories/topic.repository.js', () => ({
  topicRepository: {
    findFirstByIdAndUserId: vi.fn(),
  },
}));

describe('Question Service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('assertQuestionOwnership', () => {
    it('should throw if question not found', async () => {
      (questionRepository.findFirstWithRelations as any).mockResolvedValue(null);
      await expect(questionService.toggleSolved('u1', 'q1')).rejects.toThrow(AppError);
    });

    it('should throw if user does not own question', async () => {
      (questionRepository.findFirstWithRelations as any).mockResolvedValue({
        id: 'q1',
        topic: { userId: 'u2' },
      });
      await expect(questionService.toggleSolved('u1', 'q1')).rejects.toThrow('Unauthorized');
    });

    it('should return question if owned', async () => {
      const q = { id: 'q1', topic: { userId: 'u1' }, isSolved: false };
      (questionRepository.findFirstWithRelations as any).mockResolvedValue(q);
      (questionRepository.update as any).mockResolvedValue({ ...q, isSolved: true });
      const res = await questionService.toggleSolved('u1', 'q1');
      expect(res.isSolved).toBe(true);
      expect(cache.invalidateTag).toHaveBeenCalledWith('user:u1:topics');
    });
  });

  describe('addAttempt', () => {
    it('should calculate spaced repetition correctly', async () => {
      (questionRepository.findFirstWithRelations as any).mockResolvedValue({
        id: 'q1', topic: { userId: 'u1' }
      });
      (questionRepository.addAttemptTransaction as any).mockResolvedValue([{}, {}]);
      
      await questionService.addAttempt('u1', 'q1', { confidence: 5 });
      
      const args = (questionRepository.addAttemptTransaction as any).mock.calls[0];
      const nextReviewAt = args[3];
      expect(nextReviewAt).toBeInstanceOf(Date);
      expect(nextReviewAt.getTime()).toBeGreaterThan(Date.now());
      expect(cache.invalidateTag).toHaveBeenCalledWith('user:u1:review');
    });
  });
});
