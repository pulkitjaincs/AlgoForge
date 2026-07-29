import { Request, Response } from 'express';
import * as questionService from '../services/question.service.js';

export const create = async (req: Request, res: Response) => {
  const { topicId, subTopicId } = req.params;
  const parsedSubTopicId = subTopicId === 'null' ? null : subTopicId;
  const question = await questionService.createQuestion((req as any).user.id, topicId, parsedSubTopicId, req.body);
  res.status(201).json({ success: true, data: question });
};

export const updateNotes = async (req: Request, res: Response) => {
  const question = await questionService.updateQuestion((req as any).user.id, req.params.questionId, { notes: req.body.notes });
  res.status(200).json({ success: true, data: question });
};

export const toggleSolved = async (req: Request, res: Response) => {
  const question = await questionService.toggleSolved((req as any).user.id, req.params.questionId);
  res.status(200).json({ success: true, data: question });
};

export const remove = async (req: Request, res: Response) => {
  await questionService.deleteQuestion((req as any).user.id, req.params.questionId);
  res.status(200).json({ success: true, data: {} });
};
