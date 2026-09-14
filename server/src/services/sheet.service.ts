import { sheetRepository } from '../repositories/sheet.repository.js';
import { topicRepository } from '../repositories/topic.repository.js';
import { PublishSheetInput } from '@algoforge/shared';
import { AppError } from '../utils/AppError.js';

export const publishSheet = async (userId: string, data: PublishSheetInput) => {
  const topics = await topicRepository.findManyWithAllQuestions(userId);
  
  if (!topics || topics.length === 0) {
    throw new AppError('Cannot publish an empty sheet', 400);
  }

  if (topics.length > 100) {
    throw new AppError('Sheet exceeds maximum allowed topics (100)', 400);
  }

  let totalQuestions = 0;
  for (const topic of topics) {
    totalQuestions += (topic.questions?.length || 0);
    if (topic.subTopics) {
      for (const sub of topic.subTopics) {
        totalQuestions += (sub.questions?.length || 0);
      }
    }
  }

  if (totalQuestions > 1000) {
    throw new AppError('Sheet exceeds maximum allowed questions (1000)', 400);
  }

  const serialized = JSON.stringify(topics);
  if (Buffer.byteLength(serialized, 'utf8') > 2 * 1024 * 1024) {
    throw new AppError('Sheet data payload exceeds 2MB limit', 400);
  }

  const snapshot = JSON.parse(serialized);
  
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
