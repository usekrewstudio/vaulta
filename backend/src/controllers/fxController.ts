import { Request, Response, NextFunction } from 'express';
import { pool } from '../config/database';

// Supported currencies with static fallback rates (relative to USD)
// In production, replace with a live FX API (e.g. Open Exchange Rates, Fixer.io)
const FALLBACK_RATES: Record<string, number> = {
  USD: 1,
  NGN: 1580,
  GHS: 14.5,
  KES: 130,
  ZAR: 18.5,
  GBP: 0.79,
  EUR: 0.92,
  CAD: 1.36,
  AUD: 1.53,
  JPY: 149.5,
};

export async function getRates(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { base = 'USD' } = req.query as { base: string };
    const baseRate = FALLBACK_RATES[base.toUpperCase()];

    if (!baseRate) {
      res.status(400).json({ error: `Unsupported base currency: ${base}` });
      return;
    }

    const rates: Record<string, number> = {};
    for (const [currency, usdRate] of Object.entries(FALLBACK_RATES)) {
      rates[currency] = Number((usdRate / baseRate).toFixed(6));
    }

    res.json({
      base: base.toUpperCase(),
      rates,
      source: 'static_fallback',
      note: 'Connect a live FX API for real-time rates',
    });
  } catch (err) {
    next(err);
  }
}

export async function convert(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { from = 'USD', to = 'USD', amount = 1 } = req.query as Record<string, string>;
    const fromRate = FALLBACK_RATES[from.toUpperCase()];
    const toRate = FALLBACK_RATES[to.toUpperCase()];

    if (!fromRate || !toRate) {
      res.status(400).json({ error: 'Unsupported currency pair' });
      return;
    }

    const result = (Number(amount) / fromRate) * toRate;
    res.json({
      from: from.toUpperCase(),
      to: to.toUpperCase(),
      amount: Number(amount),
      result: Number(result.toFixed(4)),
    });
  } catch (err) {
    next(err);
  }
}

export function getSupportedCurrencies(_req: Request, res: Response): void {
  res.json({ currencies: Object.keys(FALLBACK_RATES) });
}
