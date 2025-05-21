import { Request, Response, NextFunction } from 'express';
import { storeModeratedFile } from '../services/IPFSindex.js';

export const storeModeratedFileHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.file || !req.file.buffer) {
      res.status(400).json({ success: "false", digest: 'No file uploaded' });
      return;
    }

    const { buffer, originalname, mimetype } = req.file;

    const { digest } = await storeModeratedFile(buffer, originalname, mimetype);

    // Renders an HTML view with the digest as a link
    res.status(201).json({ digest });
  } catch (error) {
    next(error);
  }
};