import { groupRepository } from '../repositories/group.repository.js';
import { CreateGroupInput, JoinGroupInput } from '@algoforge/shared';
import { AppError } from '../utils/AppError.js';
import crypto from 'crypto';

export const createGroup = async (userId: string, data: CreateGroupInput) => {
  const inviteCode = crypto.randomBytes(4).toString('hex');
  return groupRepository.create({
    name: data.name,
    inviteCode
  }, userId);
};

export const joinGroup = async (userId: string, data: JoinGroupInput) => {
  const group = await groupRepository.findByInviteCode(data.inviteCode);
  if (!group) {
    throw new AppError('Invalid invite code', 404);
  }

  const isMember = await groupRepository.isMember(group.id, userId);
  if (isMember) {
    throw new AppError('You are already a member of this group', 400);
  }

  await groupRepository.addMember(group.id, userId);
  return groupRepository.findById(group.id);
};

export const getGroup = async (userId: string, groupId: string) => {
  const isMember = await groupRepository.isMember(groupId, userId);
  if (!isMember) {
    throw new AppError('Not authorized to view this group', 403);
  }
  
  const group = await groupRepository.findById(groupId);
  if (!group) {
    throw new AppError('Group not found', 404);
  }
  return group;
};
