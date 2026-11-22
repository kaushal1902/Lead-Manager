import express, { Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/auth.routes.js';
import leadRoutes from './routes/lead.routes.js';
import { optionalAuth } from './middlewares/auth.js';
import { errorHandler } from './middlewares/errorHandler.js';
import { notFoundHandler } from './middlewares/notFoundHandler.js';

dotenv.config();

const app = express();

// Security & Parsing Middlewares
app.use(
  cors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);
app.use(express.json());

// Health check endpoint
app.get('/api/health', (_req: Request, res: Response) => {
  res.status(200).json({
    status: 'ok',
    message: 'Lead Manager API is healthy and operational',
    timestamp: new Date().toISOString(),
  });
});

// Authentication Endpoints
app.use('/api/auth', authRoutes);

// Lead REST Endpoints (with optional user-scoped auth)
app.use('/api/leads', optionalAuth, leadRoutes);

// 404 Route Handler
app.use(notFoundHandler);

// Centralized Error Handler
app.use(errorHandler);

export default app;
