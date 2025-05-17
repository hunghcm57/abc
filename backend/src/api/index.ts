import express from 'express';
import path from 'path';
import multer from 'multer';
import dotenv from 'dotenv';
import bodyParser from 'body-parser';
import {encodeDNAHandler} from '../controllers/dnaencodeController';
import {moderatescore} from '../controllers/HiveModerationController';
import {storeModeratedFileHandler} from '../controllers/IPFSindexController';
import {stakeTokens,getValidatorInfo,getAllValidators, distributeRewards} from '../controllers/tokenController';
  


dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

// Setup view engine (EJS)
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));

const upload = multer(); // memory storage

// ---------------------------
// 🚀 API Routes
// ---------------------------

// Encode DNA
app.post('/encode-dna', upload.single('file'), encodeDNAHandler);
app.get('/encode-dna', (_req, res) => {
  res.render('dna/encode/form'); // form to upload a file for DNA encoding
});

// Moderate Score
app.post('/moderate-score', upload.single('file'), moderatescore);
app.get('/moderate-score', (_req, res) => {
  res.render('moderation/score/form'); // form to upload file for moderation
});

// Store file, moderate, and return digest
app.post('/digest-ipfs', upload.single('file'), storeModeratedFileHandler);
app.get('/digest-ipfs', (_req, res) => {
  res.render('digest/form'); // upload + process form
});

// Stake token
app.get('/stake-token', stakeTokens);

// Validator endpoints
app.get('/get-vali/:address', getValidatorInfo);
app.get('/get-all', getAllValidators);

// Distribute rewards
app.post('/get-rewards', distributeRewards);

// ---------------------------
// Global Error Handler
// ---------------------------
app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error('❌ Global error:', err);
  res.status(500).render('error', { error: err.message || 'Internal Server Error' });
});

// ---------------------------
// Start the server
// ---------------------------
app.listen(port, () => {
  console.log(`🚀 Server running at http://localhost:${port}`);
});
