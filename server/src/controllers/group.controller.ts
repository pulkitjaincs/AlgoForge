import { Request, Response } from 'express';
import * as groupService from '../services/group.service.js';

export const createGroup = async (req: Request, res: Response) => {
  const group = await groupService.createGroup(req.user!.id, req.body);
  res.status(201).json({ success: true, data: group });
};

export const joinGroup = async (req: Request, res: Response) => {
  const group = await groupService.joinGroup(req.user!.id, req.body);
  res.status(200).json({ success: true, data: group });
};

export const getGroup = async (req: Request, res: Response) => {
  const id = req.params.id as string;
  const group = await groupService.getGroup(req.user!.id, id);
  res.status(200).json({ success: true, data: group });
};
