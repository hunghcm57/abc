import { Request, Response, NextFunction } from 'express';
import { storeModeratedFile } from '../services/IPFSindex';

export const storeModeratedFileHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.file || !req.file.buffer) {
      res.status(400).json({ success: false, message: 'No file uploaded' });
      return;
    }

    const { buffer, originalname, mimetype } = req.file;
    const { digest } = await storeModeratedFile(buffer, originalname, mimetype);

    // ✅ Trả digest dưới dạng JSON
    res.status(201).json({
      success: true,
      digest
    });
  } catch (error) {
    console.error('❌ Error storing moderated file:', error);
    res.status(500).json({
      success: false,
      message: 'Error storing file',
      error: error instanceof Error ? error.message : String(error)
    });
  }
};
