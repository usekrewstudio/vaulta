import { Pool } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

export const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
});

export async function connectDB(): Promise<void> {
  try {
    const client = await pool.connect();
    console.log('✅ PostgreSQL connected');
    client.release();
  } catch (err) {
    console.error('❌ PostgreSQL connection failed:', err);
    process.exit(1);
  }
}

export async function runMigrations(): Promise<void> {
  const client = await pool.connect();
  try {
    await client.query(`
      CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

      CREATE TABLE IF NOT EXISTS users (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        full_name VARCHAR(255) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        country VARCHAR(100),
        currency VARCHAR(10) DEFAULT 'USD',
        is_verified BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS otp_records (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        code VARCHAR(6) NOT NULL,
        expires_at TIMESTAMPTZ NOT NULL,
        used BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMPTZ DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS assets (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        name VARCHAR(255) NOT NULL,
        type VARCHAR(50) NOT NULL,
        symbol VARCHAR(20),
        quantity DECIMAL(20, 8) NOT NULL DEFAULT 0,
        purchase_price DECIMAL(20, 8) NOT NULL DEFAULT 0,
        current_price DECIMAL(20, 8) NOT NULL DEFAULT 0,
        currency VARCHAR(10) DEFAULT 'USD',
        notes TEXT,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS fx_rates (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        base VARCHAR(10) NOT NULL,
        target VARCHAR(10) NOT NULL,
        rate DECIMAL(20, 8) NOT NULL,
        fetched_at TIMESTAMPTZ DEFAULT NOW(),
        UNIQUE(base, target)
      );

      CREATE INDEX IF NOT EXISTS idx_assets_user_id ON assets(user_id);
      CREATE INDEX IF NOT EXISTS idx_otp_user_id ON otp_records(user_id);
    `);
    console.log('✅ Migrations complete');
  } finally {
    client.release();
  }
}
