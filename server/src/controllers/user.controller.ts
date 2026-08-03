import { Request, Response } from 'express';
import * as userService from '../services/user.service.js';

export const updateProfile = async (req: Request, res: Response) => {
  const user = await userService.updateProfile(req.user!.id, req.body);
  res.status(200).json({ success: true, data: user });
};

export const getPublicProfile = async (req: Request, res: Response) => {
  const username = req.params.username as string;
  const profile = await userService.getPublicProfile(username);
  res.status(200).json({ success: true, data: profile });
};
