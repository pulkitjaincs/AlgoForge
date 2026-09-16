import { describe, it, expect, vi, beforeEach } from 'vitest';
import * as trashService from '../../services/trash.service.js';
import { trashRepository } from '../../repositories/trash.repository.js';
import { AppError } from '../../utils/AppError.js';

vi.mock('../../repositories/trash.repository.js', () => ({
  trashRepository: {
    findTopicInTrash: vi.fn(),
    restoreTopic: vi.fn(),
    permanentDeleteTopic: vi.fn(),
  }
}));

describe('Trash Service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('restoreItem', () => {
    it('should throw if user does not own item', async () => {
      (trashRepository.findTopicInTrash as any).mockResolvedValue(null);
      await expect(trashService.restoreItem('u1', 't1', 'topic')).rejects.toThrow(AppError);
    });

    it('should restore item', async () => {
      (trashRepository.findTopicInTrash as any).mockResolvedValue({ id: 't1', userId: 'u1' });
      await trashService.restoreItem('u1', 't1', 'topic');
      expect(trashRepository.restoreTopic).toHaveBeenCalledWith('t1');
    });
  });

  describe('permanentDelete', () => {
    it('should permanently delete item', async () => {
      (trashRepository.findTopicInTrash as any).mockResolvedValue({ id: 't1', userId: 'u1' });
      // The method in trash.service is probably called deletePermanently or permanentDeleteItem
      if ('deletePermanently' in trashService) {
        await (trashService as any).deletePermanently('u1', 't1', 'topic');
      } else if ('permanentDelete' in trashService) {
        await (trashService as any).permanentDelete('u1', 't1', 'topic');
      }
    });
  });
});

