import express from 'express';
import cors from 'cors';
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

// Security
app.use(helmet());

// CORS — allow frontend + any *.vercel.app preview deployments
const allowedOrigins = [
  'http://localhost:5173',
  'https://vaulta-jade.vercel.app',
  process.env.FRONTEND_URL,
].filter(Boolean) as string[];

app.use(cors({
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin) || origin.endsWith('.vercel.app')) {
      return callback(null, true);
    }
    callback(new Error(`CORS blocked: ${origin}`));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// Handle preflight for all routes
app.options('*', cors());

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

// For local dev: start the server
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
  // In production (Vercel serverless), run migrations once on cold start
  connectDB().then(() => runMigrations()).catch(console.error);
}

// Export for Vercel serverless
export default app;
