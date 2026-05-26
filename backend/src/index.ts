import express, { Request, Response, NextFunction } from 'express';
import dotenv from 'dotenv';

dotenv.config();

const app = express();

// CORS — must be first
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

// Health — no DB, always works
app.get('/health', (_req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    env: {
      db_url_set: !!process.env.DATABASE_URL,
      db_url_preview: process.env.DATABASE_URL?.substring(0, 40) + '...',
      jwt_set: !!process.env.JWT_SECRET,
      node_env: process.env.NODE_ENV,
    }
  });
});

// Register DB routes
import('./routes/auth').then(({ default: authRoutes }) => {
  app.use('/api/auth', authRoutes);
}).catch(err => console.error('auth routes failed:', err));

import('./routes/assets').then(({ default: assetRoutes }) => {
  app.use('/api/assets', assetRoutes);
}).catch(err => console.error('asset routes failed:', err));

import('./routes/index').then(({ userRouter, fxRouter }) => {
  app.use('/api/user', userRouter);
  app.use('/api/fx', fxRouter);
}).catch(err => console.error('user/fx routes failed:', err));

// Init DB in background — don't block exports
import('./config/database').then(({ connectDB, runMigrations }) => {
  connectDB()
    .then(() => runMigrations())
    .then(() => console.log('✅ DB ready'))
    .catch(err => console.error('❌ DB error:', err));
}).catch(err => console.error('DB import failed:', err));

// 404
app.use((_req, res) => res.status(404).json({ error: 'Route not found' }));

export default app;
