// src/routes/batch.routes.ts
import express from 'express';
import { validateBatchTransfer } from '../middlewares/validation.middleware.ts';
import BatchController from '../controllers/batch.controller.ts';

const router = express.Router();

/**
 * @swagger
 * /api/v1/batch:
 *   post:
 *     tags:
 *       - Batch Transfers
 *     summary: Execute a batch transfer of ETH and/or ERC20 tokens
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               transfers:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     tokenAddress:
 *                       type: string
 *                     recipient:
 *                       type: string
 *                     amount:
 *                       type: string
 *                 minItems: 1
 *     responses:
 *       202:
 *         description: Batch transfer initiated
 *       400:
 *         description: Invalid request body
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */
router.post(
  '/',
  validateBatchTransfer,
  BatchController.executeBatchTransfer
);

// Optional additional routes
// router.get('/status/:txHash', authenticate, BatchController.getTransferStatus);
// router.get('/history', authenticate, BatchController.getTransferHistory);

export default router;