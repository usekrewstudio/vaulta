export interface User {
  id: string;
  full_name: string;
  email: string;
  country?: string;
  currency: string;
  is_verified: boolean;
  created_at: string;
}

export type AssetType = 'stock' | 'crypto' | 'real_estate' | 'cash' | 'bond' | 'mutual_fund' | 'pension' | 'other';

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
  created_at: string;
  updated_at: string;
}

export interface Portfolio {
  assets: Asset[];
  total_value: number;
  total_cost: number;
  total_gain_loss: number;
  total_gain_loss_pct: number;
  by_type: Record<AssetType, number>;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  setAuth: (user: User, token: string) => void;
  clearAuth: () => void;
}
