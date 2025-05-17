import express from 'express';
import {
  stakeTokens,
  unstakeTokens,
  getValidatorInfo,
  getAllValidators,
  distributeRewards
} from '../controllers/tokenController';

const router = express.Router();

router.get('/stake-token', stakeTokens);
router.get('/get-vali', getValidatorInfo);
router.get('/get-all', getAllValidators);
router.post('/get-rewards', distributeRewards);

export default router;
