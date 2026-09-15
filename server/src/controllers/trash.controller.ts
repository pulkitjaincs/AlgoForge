import { Request, Response } from 'express';
import { getTrashItems, restoreItem, permanentlyDeleteItem } from '../services/trash.service.js';
import { Topic, SubTopic, Question } from '@prisma/client';

export const getTrash = async (req: Request, res: Response) => {
  const userId = req.user!.id;
  
  const trashItems = await getTrashItems(userId);

  const formattedItems = [
    ...trashItems.topics.map((t: Topic) => ({ ...t, type: 'topic' })),
    ...trashItems.subTopics.map((s: SubTopic) => ({ ...s, type: 'subtopic' })),
    ...trashItems.questions.map((q: Question) => ({ ...q, type: 'question' })),
  ].sort((a, b) => new Date(b.deletedAt!).getTime() - new Date(a.deletedAt!).getTime());

  res.status(200).json({
    success: true,
    data: formattedItems,
  });
};

export const restore = async (req: Request, res: Response) => {
  const userId = req.user!.id;
  const id = req.params.id as string;
  const type = req.body.type as 'topic' | 'subtopic' | 'question';

  const restored = await restoreItem(userId, id, type);

  res.status(200).json({
    success: true,
    data: restored,
  });
};

export const permanentDelete = async (req: Request, res: Response) => {
  const userId = req.user!.id;
  const id = req.params.id as string;
  const type = req.body.type as 'topic' | 'subtopic' | 'question';

  await permanentlyDeleteItem(userId, id, type);

  res.status(200).json({
    success: true,
    data: { message: 'Item permanently deleted' },
  });
};
