import Joi from 'joi';
import log from '../utils/logger.ts';

const batchTransferSchema = Joi.object({
    transfers: Joi.array().items(
        Joi.object({
            tokenAddress: Joi.string().pattern(/^0x[a-fA-F0-9]{40}$/).required(),
            recipient: Joi.string().pattern(/^0x[a-fA-F0-9]{40}$/).required(),
            amount: Joi.string().pattern(/^[0-9]+$/).required()
        })
    ).min(1).required()
});

export const validateBatchTransfer = (req, res, next) => {
    const { error } = batchTransferSchema.validate(req.body);

    if (error) {
        log.Error('Validation failed', error.details);
        return res.status(400).json({
            success: false,
            error: error.details[0].message
        });
    }

    next();
};