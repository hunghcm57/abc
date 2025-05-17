import { Request, Response, NextFunction } from 'express';
import { moderate } from '../services/HiveModeration';

export const moderatescore = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const result = await moderate(req.file!.path);
  res.render('HiveModeration/moderatescore ', { result });
};
