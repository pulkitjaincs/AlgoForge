import { Request, Response } from 'express';
import * as topicService from '../services/topic.service.js';

export const getAll = async (req: Request, res: Response) => {
  const filters: topicService.TopicFilters = {
    difficulty: req.query.difficulty as string,
    platform: req.query.platform as string,
    isSolved: req.query.isSolved as string,
    isStarred: req.query.isStarred as string,
    tag: req.query.tag as string,
  };
  Object.keys(filters).forEach(key => filters[key as keyof topicService.TopicFilters] === undefined && delete filters[key as keyof topicService.TopicFilters]);

  const topics = await topicService.getAllTopics(req.user!.id, filters);
  res.status(200).json({ success: true, data: topics });
};

export const create = async (req: Request, res: Response) => {
  const topic = await topicService.createTopic(req.user!.id, req.body);
  res.status(201).json({ success: true, data: topic });
};

export const update = async (req: Request, res: Response) => {
  const topic = await topicService.updateTopic(req.params.topicId as string, req.user!.id, req.body);
  res.status(200).json({ success: true, data: topic });
};

export const remove = async (req: Request, res: Response) => {
  await topicService.deleteTopic(req.params.topicId as string, req.user!.id);
  res.status(200).json({ success: true, data: {} });
};

export const reorder = async (req: Request, res: Response) => {
  await topicService.reorderTopics(req.user!.id, req.body.orderedIds);
  res.status(200).json({ success: true, data: {} });
};
