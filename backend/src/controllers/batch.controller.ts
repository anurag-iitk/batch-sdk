import blockchainService from '../services/blockchain.service.ts';
import { validateBatchTransfer } from '../middlewares/validation.middleware.ts';
import log from '../utils/logger.ts';

class BatchController {
    async executeBatchTransfer(req, res) {
        try {
            const { transfers } = req.body;

            const tx = await blockchainService.executeBatchTransfer(transfers);

            res.status(202).json({
                success: true,
                transactionHash: tx.hash,
                message: 'Batch transfer initiated'
            });

            log.Info(`Batch transfer initiated - TX: ${tx.hash}`);
        } catch (error) {
            log.Error('Batch transfer error', error);
            res.status(500).json({
                success: false,
                error: 'Failed to process batch transfer'
            });
        }
    }
}

export default new BatchController();