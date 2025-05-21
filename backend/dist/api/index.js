import express from 'express';
import path from 'path';
import multer from 'multer';
import dotenv from 'dotenv';
import cors from 'cors';
import encodednaRoutes from '../routes/dnaencodeRoutes.js';
import digestipfsRoutes from '../routes/IPFSindexRoutes.js';
import tokenRoutes from '../routes/tokenRoutes.js';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
dotenv.config();
const app = express();
const port = process.env.PORT || 3000;
app.use(cors({ origin: 'http://localhost:5173' })); // Cho phép React frontend truy cập
// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));
const upload = multer(); // memory storage
// ---------------------------
// Routes
// ---------------------------
// Route mặc định
app.get('/', (_req, res) => {
    res.status(200).json({ message: 'Welcome to Scoin backend API' });
});
// Encode DNA
app.post('/encode-dna', upload.single('file'), encodednaRoutes);
// IPFS + Digest
app.post('/digest-ipfs', upload.single('file'), digestipfsRoutes);
// Token and validator routes
app.use('/token', tokenRoutes); // Mount tất cả các token routes
//  Global error handler (trả JSON)
app.use((err, _req, res, _next) => {
    console.error('❌ Global error:', err);
    res.status(500).json({ error: err.message || 'Internal Server Error' });
});
app.listen(port, () => {
    console.log(`🚀 Server started at http://localhost:${port}`);
});
