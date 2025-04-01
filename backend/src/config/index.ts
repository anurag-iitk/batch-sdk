// config/index.ts
import dotenv from 'dotenv';

dotenv.config();

export default {
    nodeEnv: process.env.NODE_ENV || 'development',
    port: parseInt(process.env.PORT || '3000', 10),
    infura: {
        apiKey: process.env.INFURA_API_KEY!,
        network: process.env.INFURA_NETWORK || 'holesky'
    },
    contracts: {
        diamondAddress: process.env.DIAMOND_CONTRACT_ADDRESS!,
        tokenAddress: process.env.TOKEN_CONTRACT_ADDRESS!
    },
    security: {
        jwtSecret: process.env.JWT_SECRET!,
        rateLimit: {
            windowMs: 15 * 60 * 1000,
            max: 100
        }
    }
};