import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import config from './config/index.ts';
import errorHandler from './middlewares/error.middleware.ts';
import dotenv from 'dotenv';
import log from './utils/logger.ts';
import routes from './routes/batch.routes.ts';
import swaggerUI from 'swagger-ui-express';
import swaggerSpec from '../swagger.ts';

dotenv.config();
const app = express();

// Security Middlewares
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rate Limiting
app.use(
  rateLimit(config.security.rateLimit)
);

// Error Handling
app.use(errorHandler);

// Serve Swagger documentation
app.use('/api-docs', swaggerUI.serve, swaggerUI.setup(swaggerSpec));

app.use('/api/v1/batch', routes);

const PORT = process.env.PORT || 3000;

app.get('/health', async (req, res) => {
  try {
    res.json({
      status: 'OK',
    });
  } catch (error) {
    res.status(500).json({ status: 'ERROR' });
  }
});

app.listen(PORT, () => {
  log.Info(`Server is running on http://localhost:${PORT}`)
});