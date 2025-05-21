import { ethers } from 'ethers';
import dotenv from 'dotenv';
import ScoinABI from '../abi/token.json' with { type: "json" };
import multer from 'multer';
const upload = multer();
dotenv.config();
const { ETH_RPC_URL, PRIVATE_KEY, SCOIN_ADDRESS } = process.env;
if (!PRIVATE_KEY || !SCOIN_ADDRESS) {
    console.error('Environment variables PRIVATE_KEY and SCOIN_ADDRESS must be set.');
    process.exit(1);
}
const provider = new ethers.providers.JsonRpcProvider(ETH_RPC_URL);
const signer = new ethers.Wallet(PRIVATE_KEY, provider);
const scoin = new ethers.Contract(SCOIN_ADDRESS, ScoinABI, signer);
// Stake tokens and render result
export const stakeTokens = async (req, res) => {
    const { validator, amount } = req.body;
    if (!validator || !amount) {
        res.status(400).json({
            message: 'Validator address and amount are required.',
        });
        return;
    }
    const tx = await scoin.stake(validator, ethers.utils.parseUnits(amount.toString(), 18));
    await tx.wait();
    res.status(200).json({
        message: ` Staked! TxHash: ${tx.hash}`,
    });
    return;
};
//  Unstake tokens and render result
export const unstakeTokens = async (req, res) => {
    const { validator } = req.body;
    if (!validator) {
        res.status(400).json({
            message: 'Validator address is required.',
        });
        return;
    }
    const tx = await scoin.unstake(validator);
    await tx.wait();
    res.status(200).json({
        message: ` Unstaked! TxHash: ${tx.hash}`,
    });
    return;
};
// Get a validator's info
export const getValidatorInfo = async (req, res) => {
    const { address } = req.params;
    const info = await scoin.getValidatorInfo(address);
    res.status(200).json('{ info }');
    return;
};
//  Get all validators
export const getAllValidators = async (_req, res) => {
    const validators = await scoin.getValidators();
    res.status(200).json({ validators });
    return;
};
//  Distribute rewards
export const distributeRewards = async (_req, res) => {
    const tx = await scoin.distributeRewards();
    await tx.wait();
    res.status(200).json({
        message: `🎉 Rewards Distributed! TxHash: ${tx.hash}`,
    });
    return;
};
