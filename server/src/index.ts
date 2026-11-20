import express, { Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Health check endpoint
app.get('/api/health', (_req: Request, res: Response) => {
  res.status(200).json({
    status: 'ok',
    message: 'Lead Manager API is healthy and operational',
    timestamp: new Date().toISOString()
  });
});

app.listen(PORT, () => {
  console.log(`[server] Server listening on http://localhost:${PORT}`);
});
