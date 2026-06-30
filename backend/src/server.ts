import dotenv from 'dotenv';
// Load environment variables first
dotenv.config();

import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import apiRoutes from './routes/api.routes';

const app = express();
const PORT = process.env.PORT || 5000;

// Security configuration
app.use(helmet());

// CORS configuration (allow requests from Vite frontend)
app.use(
  cors({
    origin: '*', // For development, allow all. In production, configure to frontend domain.
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

app.use(express.json());

// Global Rate Limiting: 200 requests per 15 minutes per IP
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
  message: { error: 'Too many requests from this IP, please try again after 15 minutes' },
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/api/', limiter);

// API Routes
app.use('/api', apiRoutes);

// Base route health check
app.get('/health', (_req: Request, res: Response) => {
  res.json({ status: 'healthy', timestamp: new Date().toISOString() });
});

// Centralized error handler middleware
app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
  console.error('🔥 Server Error Caught:', err);

  const status = err.status || 500;
  res.status(status).json({
    error: err.message || 'Internal Server Error',
    details: process.env.NODE_ENV === 'development' ? err.stack : undefined,
  });
});

if (process.env.NODE_ENV !== 'production' || !process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log(`🚀 AmodXpress Billing System server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
  });
}

export default app;
