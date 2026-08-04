import { Request, Response } from 'express';
import { getTrashItems, restoreItem, permanentlyDeleteItem } from '../services/trash.service.js';

export const getTrash = async (req: Request, res: Response) => {
  const userId = req.user!.id;
  
  const trashItems = await getTrashItems(userId);

  res.status(200).json({
    success: true,
    data: trashItems,
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
