import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import cookieParser from 'cookie-parser';

import { env } from './config/env.js';
import { requestId } from './middleware/requestId.js';
import { requestLogger } from './middleware/requestLogger.js';
import { sanitize } from './middleware/sanitize.js';
import { errorHandler } from './middleware/errorHandler.js';
import { setupSwagger } from './config/swagger.js';

import apiRoutes from './routes/index.js';

const app = express();

// Security & Parsing
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'", env.CLIENT_URL || "http://localhost:5173"],
    },
  },
  crossOriginEmbedderPolicy: false,
}));
app.use(cors({ origin: env.CLIENT_URL, credentials: true }));
app.use(compression());
app.use(express.json({ limit: '1mb' }));
app.use(cookieParser());
app.use(sanitize);

import { doubleCsrfProtection, generateToken } from './config/csrf.js';
app.use(doubleCsrfProtection);

app.get('/api/v1/csrf-token', (req, res) => {
  const token = generateToken(req, res);
  res.json({ token });
});

// Rate Limiting
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 500,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, error: 'Too many requests, please try again later' },
});
app.use(generalLimiter);

// Observability
app.use(requestId);
app.use(requestLogger);

// Routes
app.use('/api/v1', apiRoutes);

// Swagger Docs
setupSwagger(app);

// 404 + Global error handler
app.use((_req, res) => {
  res.status(404).json({ success: false, error: 'Endpoint not found' });
});
app.use(errorHandler);

export default app;
