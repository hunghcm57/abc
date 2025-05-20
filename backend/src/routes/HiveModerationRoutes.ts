// backend/src/routes/HiveModerationRoutes.ts
import express from 'express';
import multer from 'multer';
import { moderatescore } from '../controllers/HiveModerationController';

const router = express.Router();

// Setup multer (memory storage,  { dest: 'uploads/' } memory storage temporarrily)
const upload = multer({ storage: multer.memoryStorage() });

// Route: POST /api/moderate
router.post('/moderate-score', upload.single('file'), moderatescore);
router.get('/moderate-score', moderatescore);
export default router;
