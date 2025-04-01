import log from '../utils/logger.ts';

const errorHandler = (err, req, res, next) => {
    log.Error(`Error: ${err.message}`, {
        path: req.path,
        method: req.method,
        stack: err.stack
    });

    res.status(500).json({
        success: false,
        error: process.env.NODE_ENV === 'production'
            ? 'Internal server error'
            : err.message
    });
};

export default errorHandler;