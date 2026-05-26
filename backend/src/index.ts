import express, { Request, Response, NextFunction } from 'express';
import helmet from 'helmet';
import dotenv from 'dotenv';
import { connectDB, runMigrations } from './config/database';
import { errorHandler } from './middleware/errorHandler';
import authRoutes from './routes/auth';
import assetRoutes from './routes/assets';
import { userRouter, fxRouter } from './routes/index';

dotenv.config();

const app = express();
const PORT = process.env.PORT ?? 3001;

// --- Manual CORS middleware (runs before everything, always) ---
app.use((req: Request, res: Response, next: NextFunction) => {
  const origin = req.headers.origin ?? '*';
  res.setHeader('Access-Control-Allow-Origin', origin);
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,PATCH,DELETE,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type,Authorization');

  // Respond to preflight immediately
  if (req.method === 'OPTIONS') {
    res.sendStatus(204);
    return;
  }
  next();
});

app.use(helmet({ crossOriginResourcePolicy: false }));
app.use(express.json());

// Health check
app.get('/health', (_req, res) => res.json({ status: 'ok', timestamp: new Date().toISOString() }));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/assets', assetRoutes);
app.use('/api/user', userRouter);
app.use('/api/fx', fxRouter);

// 404
app.use((_req, res) => res.status(404).json({ error: 'Route not found' }));

// Error handler
app.use(errorHandler);

// Local dev
if (process.env.NODE_ENV !== 'production') {
  async function bootstrap(): Promise<void> {
    await connectDB();
    await runMigrations();
    app.listen(PORT, () => {
      console.log(`🚀 Vaulta API running on http://localhost:${PORT}`);
    });
  }
  bootstrap();
} else {
  connectDB().then(() => runMigrations()).catch(console.error);
}

export default app;
