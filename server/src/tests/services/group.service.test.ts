import { describe, it, expect, vi, beforeEach } from 'vitest';
import * as groupService from '../../services/group.service.js';
import { groupRepository } from '../../repositories/group.repository.js';
import { AppError } from '../../utils/AppError.js';

vi.mock('../../repositories/group.repository.js', () => ({
  groupRepository: {
    create: vi.fn(),
    findByInviteCode: vi.fn(),
    isMember: vi.fn(),
    addMember: vi.fn(),
    leaveGroupTransaction: vi.fn(),
  }
}));

describe('Group Service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('joinGroup', () => {
    it('should throw if invite code is invalid', async () => {
      (groupRepository.findByInviteCode as any).mockResolvedValue(null);
      await expect(groupService.joinGroup('u1', { inviteCode: 'invalid' })).rejects.toThrow(AppError);
    });

    it('should throw if already a member', async () => {
      (groupRepository.findByInviteCode as any).mockResolvedValue({ id: 'g1' });
      (groupRepository.isMember as any).mockResolvedValue(true);
      await expect(groupService.joinGroup('u1', { inviteCode: 'valid' })).rejects.toThrow(AppError);
    });
  });

  describe('leaveGroup', () => {
    it('should call leaveGroupTransaction', async () => {
      (groupRepository.isMember as any).mockResolvedValue(true);
      await groupService.leaveGroup('u1', 'g1');
      expect(groupRepository.leaveGroupTransaction).toHaveBeenCalledWith('g1', 'u1');
    });
  });
});
