export interface User {
  id: string;
  full_name: string;
  email: string;
  password_hash: string;
  country?: string;
  currency: string;
  is_verified: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface OtpRecord {
  id: string;
  user_id: string;
  code: string;
  expires_at: Date;
  used: boolean;
  created_at: Date;
}

export type AssetType =
  | 'stock'
  | 'crypto'
  | 'real_estate'
  | 'cash'
  | 'bond'
  | 'mutual_fund'
  | 'pension'
  | 'other';

export interface Asset {
  id: string;
  user_id: string;
  name: string;
  type: AssetType;
  symbol?: string;
  quantity: number;
  purchase_price: number;
  current_price: number;
  currency: string;
  notes?: string;
  created_at: Date;
  updated_at: Date;
}

export interface Portfolio {
  assets: Asset[];
  total_value_usd: number;
  total_cost_usd: number;
  total_gain_loss_usd: number;
  total_gain_loss_pct: number;
  by_type: Record<AssetType, number>;
}

export interface FxRate {
  base: string;
  target: string;
  rate: number;
  fetched_at: Date;
}

export interface AuthRequest extends Express.Request {
  user?: { id: string; email: string };
}

// Extend Express Request
declare global {
  namespace Express {
    interface Request {
      user?: { id: string; email: string };
    }
  }
}
