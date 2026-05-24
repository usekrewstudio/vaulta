import { create } from 'zustand';
import { AuthState, User } from '../types';

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: localStorage.getItem('vaulta_token'),
  isAuthenticated: !!localStorage.getItem('vaulta_token'),

  setAuth: (user: User, token: string) => {
    localStorage.setItem('vaulta_token', token);
    set({ user, token, isAuthenticated: true });
  },

  clearAuth: () => {
    localStorage.removeItem('vaulta_token');
    set({ user: null, token: null, isAuthenticated: false });
  },
}));
