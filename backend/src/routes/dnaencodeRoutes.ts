import express from 'express';
import multer from 'multer';
import { encodeDNA } from '../controllers/dnaencodeController';

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

router.post('/encode-dna', encodeDNA );
router.get('/encode-dna', encodeDNA );
export default router;