import { describe, it, expect, vi, beforeEach } from 'vitest';
import * as sheetService from '../../services/sheet.service.js';
import { sheetRepository } from '../../repositories/sheet.repository.js';
import { backgroundQueue } from '../../workers/queues.js';
import { AppError } from '../../utils/AppError.js';

vi.mock('../../repositories/sheet.repository.js', () => ({
  sheetRepository: {
    create: vi.fn(),
    findById: vi.fn(),
    incrementCloneCount: vi.fn(),
  }
}));

vi.mock('../../workers/queues.js', () => ({
  backgroundQueue: {
    add: vi.fn()
  }
}));

describe('Sheet Service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('cloneSheet', () => {
    it('should throw if sheet is not public', async () => {
      (sheetRepository.findById as any).mockResolvedValue({ id: 's1', isPublic: false });
      await expect(sheetService.cloneSheet('u1', 's1')).rejects.toThrow(AppError);
    });

    it('should enqueue clone job', async () => {
      (sheetRepository.findById as any).mockResolvedValue({ id: 's1', isPublic: true });
      await sheetService.cloneSheet('u1', 's1');
      expect(backgroundQueue!.add).toHaveBeenCalledWith('sheet-clone', expect.anything(), expect.anything());
    });
  });
});
