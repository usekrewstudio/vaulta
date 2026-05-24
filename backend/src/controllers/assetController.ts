import { Request, Response, NextFunction } from 'express';
import { pool } from '../config/database';
import { createError } from '../middleware/errorHandler';
import { AssetType } from '../types';

export async function getPortfolio(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = req.user!.id;
    const result = await pool.query(
      'SELECT * FROM assets WHERE user_id = $1 ORDER BY created_at DESC',
      [userId]
    );

    const assets = result.rows;
    const totalValue = assets.reduce((sum: number, a: any) => sum + Number(a.current_price) * Number(a.quantity), 0);
    const totalCost = assets.reduce((sum: number, a: any) => sum + Number(a.purchase_price) * Number(a.quantity), 0);
    const gainLoss = totalValue - totalCost;
    const gainLossPct = totalCost > 0 ? (gainLoss / totalCost) * 100 : 0;

    const byType: Record<string, number> = {};
    for (const a of assets) {
      byType[a.type] = (byType[a.type] ?? 0) + Number(a.current_price) * Number(a.quantity);
    }

    res.json({
      assets,
      total_value: totalValue,
      total_cost: totalCost,
      total_gain_loss: gainLoss,
      total_gain_loss_pct: Number(gainLossPct.toFixed(2)),
      by_type: byType,
    });
  } catch (err) {
    next(err);
  }
}

export async function createAsset(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = req.user!.id;
    const { name, type, symbol, quantity, purchase_price, current_price, currency, notes } = req.body;

    const validTypes: AssetType[] = ['stock', 'crypto', 'real_estate', 'cash', 'bond', 'mutual_fund', 'pension', 'other'];
    if (!validTypes.includes(type)) throw createError('Invalid asset type', 400);

    const result = await pool.query(
      `INSERT INTO assets (user_id, name, type, symbol, quantity, purchase_price, current_price, currency, notes)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9) RETURNING *`,
      [userId, name, type, symbol ?? null, quantity, purchase_price, current_price ?? purchase_price, currency ?? 'USD', notes ?? null]
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    next(err);
  }
}

export async function updateAsset(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = req.user!.id;
    const { id } = req.params;
    const { name, symbol, quantity, purchase_price, current_price, currency, notes } = req.body;

    const existing = await pool.query('SELECT id FROM assets WHERE id = $1 AND user_id = $2', [id, userId]);
    if (existing.rows.length === 0) throw createError('Asset not found', 404);

    const result = await pool.query(
      `UPDATE assets SET
        name = COALESCE($1, name),
        symbol = COALESCE($2, symbol),
        quantity = COALESCE($3, quantity),
        purchase_price = COALESCE($4, purchase_price),
        current_price = COALESCE($5, current_price),
        currency = COALESCE($6, currency),
        notes = COALESCE($7, notes),
        updated_at = NOW()
       WHERE id = $8 AND user_id = $9 RETURNING *`,
      [name, symbol, quantity, purchase_price, current_price, currency, notes, id, userId]
    );

    res.json(result.rows[0]);
  } catch (err) {
    next(err);
  }
}

export async function deleteAsset(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = req.user!.id;
    const { id } = req.params;

    const result = await pool.query(
      'DELETE FROM assets WHERE id = $1 AND user_id = $2 RETURNING id',
      [id, userId]
    );
    if (result.rows.length === 0) throw createError('Asset not found', 404);

    res.json({ message: 'Asset deleted' });
  } catch (err) {
    next(err);
  }
}
