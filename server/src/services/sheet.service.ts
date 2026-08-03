import { sheetRepository } from '../repositories/sheet.repository.js';
import { topicRepository } from '../repositories/topic.repository.js';
import { PublishSheetInput } from '@algoforge/shared';
import { AppError } from '../utils/AppError.js';

export const publishSheet = async (userId: string, data: PublishSheetInput) => {
  const topics = await topicRepository.findManyWithAllQuestions(userId);
  
  if (!topics || topics.length === 0) {
    throw new AppError('Cannot publish an empty sheet', 400);
  }

  const snapshot = JSON.parse(JSON.stringify(topics));
  
  return sheetRepository.create({
    title: data.title,
    description: data.description,
    isPublic: data.isPublic ?? true,
    author: { connect: { id: userId } },
    topics: snapshot,
  });
};

export const getPublicSheets = async (page: number = 1, limit: number = 20) => {
  return sheetRepository.findPublicSheets(page, limit);
};

export const getSheetById = async (id: string) => {
  const sheet = await sheetRepository.findById(id);
  if (!sheet) {
    throw new AppError('Sheet not found', 404);
  }
  return sheet;
};
