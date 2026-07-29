import { Request, Response } from 'express';
import * as subtopicService from '../services/subtopic.service.js';

export const create = async (req: Request, res: Response) => {
  const subTopic = await subtopicService.createSubTopic((req as any).user.id, req.params.topicId as string, req.body);
  res.status(201).json({ success: true, data: subTopic });
};

export const update = async (req: Request, res: Response) => {
  const subTopic = await subtopicService.updateSubTopic((req as any).user.id, req.params.subTopicId as string, req.body);
  res.status(200).json({ success: true, data: subTopic });
};

export const remove = async (req: Request, res: Response) => {
  await subtopicService.deleteSubTopic((req as any).user.id, req.params.subTopicId as string);
  res.status(200).json({ success: true, data: {} });
};

export const reorder = async (req: Request, res: Response) => {
  await subtopicService.reorderSubTopics((req as any).user.id, req.params.topicId as string, req.body.orderedIds);
  res.status(200).json({ success: true, data: {} });
};
