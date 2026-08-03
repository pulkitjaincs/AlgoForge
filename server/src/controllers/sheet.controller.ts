import { Request, Response } from 'express';
import * as sheetService from '../services/sheet.service.js';

export const publishSheet = async (req: Request, res: Response) => {
  const sheet = await sheetService.publishSheet(req.user!.id, req.body);
  res.status(201).json({ success: true, data: sheet });
};

export const getPublicSheets = async (req: Request, res: Response) => {
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 20;
  
  const result = await sheetService.getPublicSheets(page, limit);
  res.status(200).json({ success: true, ...result });
};

export const getSheetById = async (req: Request, res: Response) => {
  const id = req.params.id as string;
  const sheet = await sheetService.getSheetById(id);
  res.status(200).json({ success: true, data: sheet });
};
