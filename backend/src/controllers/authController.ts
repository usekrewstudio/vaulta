import { Request, Response, NextFunction } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import { pool } from '../config/database';
import { sendOtpEmail, sendWelcomeEmail } from '../services/emailService';
import { createError } from '../middleware/errorHandler';

function generateOtp(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

function signToken(id: string, email: string): string {
  const expiresIn = (process.env.JWT_EXPIRES_IN ?? '7d') as any;
  return jwt.sign({ id, email }, process.env.JWT_SECRET!, { expiresIn });
}

export async function signup(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { full_name, email, password, country } = req.body;

    const existing = await pool.query('SELECT id FROM users WHERE email = $1', [email.toLowerCase()]);
    if (existing.rows.length > 0) {
      throw createError('Email already registered', 409);
    }

    const password_hash = await bcrypt.hash(password, 12);
    const currency = countryCurrencyMap[country] ?? 'USD';

    const result = await pool.query(
      `INSERT INTO users (full_name, email, password_hash, country, currency)
       VALUES ($1, $2, $3, $4, $5) RETURNING id, email, full_name`,
      [full_name.trim(), email.toLowerCase(), password_hash, country ?? null, currency]
    );

    const user = result.rows[0];
    const otp = generateOtp();
    const expiresAt = new Date(Date.now() + Number(process.env.OTP_EXPIRES_MINUTES ?? 10) * 60 * 1000);

    await pool.query(
      `INSERT INTO otp_records (user_id, code, expires_at) VALUES ($1, $2, $3)`,
      [user.id, otp, expiresAt]
    );

    await sendOtpEmail(user.email, user.full_name, otp);

    res.status(201).json({
      message: 'Account created. Check your email for the verification code.',
      user_id: user.id,
    });
  } catch (err) {
    next(err);
  }
}

export async function verifyOtp(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { user_id, code } = req.body;

    const otpResult = await pool.query(
      `SELECT * FROM otp_records
       WHERE user_id = $1 AND code = $2 AND used = FALSE AND expires_at > NOW()
       ORDER BY created_at DESC LIMIT 1`,
      [user_id, code]
    );

    if (otpResult.rows.length === 0) {
      throw createError('Invalid or expired OTP', 400);
    }

    const otp = otpResult.rows[0];
    await pool.query('UPDATE otp_records SET used = TRUE WHERE id = $1', [otp.id]);
    await pool.query(
      'UPDATE users SET is_verified = TRUE, updated_at = NOW() WHERE id = $1',
      [user_id]
    );

    const userResult = await pool.query(
      'SELECT id, email, full_name, country, currency FROM users WHERE id = $1',
      [user_id]
    );
    const user = userResult.rows[0];

    await sendWelcomeEmail(user.email, user.full_name);

    const token = signToken(user.id, user.email);
    res.json({ token, user });
  } catch (err) {
    next(err);
  }
}

export async function resendOtp(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { user_id } = req.body;

    const userResult = await pool.query(
      'SELECT id, email, full_name, is_verified FROM users WHERE id = $1',
      [user_id]
    );
    if (userResult.rows.length === 0) throw createError('User not found', 404);

    const user = userResult.rows[0];
    if (user.is_verified) throw createError('Email already verified', 400);

    await pool.query('UPDATE otp_records SET used = TRUE WHERE user_id = $1', [user_id]);

    const otp = generateOtp();
    const expiresAt = new Date(Date.now() + Number(process.env.OTP_EXPIRES_MINUTES ?? 10) * 60 * 1000);
    await pool.query(
      'INSERT INTO otp_records (user_id, code, expires_at) VALUES ($1, $2, $3)',
      [user_id, otp, expiresAt]
    );

    await sendOtpEmail(user.email, user.full_name, otp);
    res.json({ message: 'OTP resent' });
  } catch (err) {
    next(err);
  }
}

export async function login(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { email, password } = req.body;

    const result = await pool.query('SELECT * FROM users WHERE email = $1', [email.toLowerCase()]);
    if (result.rows.length === 0) throw createError('Invalid credentials', 401);

    const user = result.rows[0];
    if (!user.is_verified) throw createError('Please verify your email first', 403);

    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid) throw createError('Invalid credentials', 401);

    const token = signToken(user.id, user.email);
    res.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        full_name: user.full_name,
        country: user.country,
        currency: user.currency,
      },
    });
  } catch (err) {
    next(err);
  }
}

export async function getMe(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const result = await pool.query(
      'SELECT id, full_name, email, country, currency, is_verified, created_at FROM users WHERE id = $1',
      [req.user!.id]
    );
    if (result.rows.length === 0) throw createError('User not found', 404);
    res.json(result.rows[0]);
  } catch (err) {
    next(err);
  }
}

const countryCurrencyMap: Record<string, string> = {
  Nigeria: 'NGN',
  Ghana: 'GHS',
  Kenya: 'KES',
  'South Africa': 'ZAR',
  'United Kingdom': 'GBP',
  'United States': 'USD',
  Canada: 'CAD',
};
