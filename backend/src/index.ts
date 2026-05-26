import express, { Request, Response, NextFunction } from 'express';
import dotenv from 'dotenv';

dotenv.config();

const app = express();

// CORS — absolute first, no dependencies
app.use((req: Request, res: Response, next: NextFunction) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Methods', 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Origin,X-Requested-With,Content-Type,Accept,Authorization');
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }
  next();
});

app.use(express.json());

// Health check — no DB dependency
app.get('/health', (_req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    db_url_set: !!process.env.DATABASE_URL,
    node_env: process.env.NODE_ENV,
  });
});

// Lazy-load routes so a DB crash doesn't kill the whole function
async function registerRoutes() {
  try {
    const { connectDB, runMigrations } = await import('./config/database');
    await connectDB();
    await runMigrations();

    const { default: authRoutes } = await import('./routes/auth');
    const { default: assetRoutes } = await import('./routes/assets');
    const { userRouter, fxRouter } = await import('./routes/index');

    app.use('/api/auth', authRoutes);
    app.use('/api/assets', assetRoutes);
    app.use('/api/user', userRouter);
    app.use('/api/fx', fxRouter);

    console.log('✅ Routes registered');
  } catch (err) {
    console.error('❌ Failed to register routes:', err);
    // Still serve CORS + a useful error on all API routes
    app.use('/api', (_req, res) => {
      res.status(503).json({ error: 'Service unavailable — DB connection failed', detail: String(err) });
    });
  }
}

// 404 fallback
app.use((_req, res) => res.status(404).json({ error: 'Route not found' }));

// Bootstrap
const PORT = process.env.PORT ?? 3001;
if (process.env.NODE_ENV !== 'production') {
  registerRoutes().then(() => {
    app.listen(PORT, () => console.log(`🚀 Running on http://localhost:${PORT}`));
  });
} else {
  registerRoutes();
}

export default app;
