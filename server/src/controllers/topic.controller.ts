import { Request, Response } from 'express';
import * as topicService from '../services/topic.service.js';

export const getAll = async (req: Request, res: Response) => {
  const topics = await topicService.getAllTopics((req as any).user.id);
  res.status(200).json({ success: true, data: topics });
};

export const create = async (req: Request, res: Response) => {
  const topic = await topicService.createTopic((req as any).user.id, req.body);
  res.status(201).json({ success: true, data: topic });
};

export const update = async (req: Request, res: Response) => {
  const topic = await topicService.updateTopic(req.params.topicId, (req as any).user.id, req.body);
  res.status(200).json({ success: true, data: topic });
};

export const remove = async (req: Request, res: Response) => {
  await topicService.deleteTopic(req.params.topicId, (req as any).user.id);
  res.status(200).json({ success: true, data: {} });
};

export const reorder = async (req: Request, res: Response) => {
  await topicService.reorderTopics((req as any).user.id, req.body.orderedIds);
  res.status(200).json({ success: true, data: {} });
};
