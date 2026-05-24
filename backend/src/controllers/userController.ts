import { Request, Response, NextFunction } from 'express';
import bcrypt from 'bcryptjs';
import { pool } from '../config/database';
import { createError } from '../middleware/errorHandler';

export async function updateProfile(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = req.user!.id;
    const { full_name, country, currency } = req.body;

    const result = await pool.query(
      `UPDATE users SET
        full_name = COALESCE($1, full_name),
        country = COALESCE($2, country),
        currency = COALESCE($3, currency),
        updated_at = NOW()
       WHERE id = $4
       RETURNING id, full_name, email, country, currency, is_verified, created_at`,
      [full_name, country, currency, userId]
    );

    res.json(result.rows[0]);
  } catch (err) {
    next(err);
  }
}

export async function changePassword(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = req.user!.id;
    const { current_password, new_password } = req.body;

    const result = await pool.query('SELECT password_hash FROM users WHERE id = $1', [userId]);
    if (result.rows.length === 0) throw createError('User not found', 404);

    const valid = await bcrypt.compare(current_password, result.rows[0].password_hash);
    if (!valid) throw createError('Current password is incorrect', 400);

    const password_hash = await bcrypt.hash(new_password, 12);
    await pool.query('UPDATE users SET password_hash = $1, updated_at = NOW() WHERE id = $2', [password_hash, userId]);

    res.json({ message: 'Password updated successfully' });
  } catch (err) {
    next(err);
  }
}

export async function deleteAccount(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = req.user!.id;
    await pool.query('DELETE FROM users WHERE id = $1', [userId]);
    res.json({ message: 'Account deleted' });
  } catch (err) {
    next(err);
  }
}
