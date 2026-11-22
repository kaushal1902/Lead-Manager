import express, { Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import leadRoutes from './routes/lead.routes.js';
import { errorHandler } from './middlewares/errorHandler.js';
import { notFoundHandler } from './middlewares/notFoundHandler.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Security & Parsing Middlewares
app.use(cors());
app.use(express.json());

// Health check endpoint
app.get('/api/health', (_req: Request, res: Response) => {
  res.status(200).json({
    status: 'ok',
    message: 'Lead Manager API is healthy and operational',
    timestamp: new Date().toISOString(),
  });
});

// Lead REST Endpoints
app.use('/api/leads', leadRoutes);

// 404 Route Handler
app.use(notFoundHandler);

// Centralized Error Handler
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`[server] Server listening on http://localhost:${PORT}`);
});

export default app;
