import { create } from 'zustand';
import { User } from '../types/auth.types.js';

interface AdminAuthState {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  setAuth: (user: User, accessToken: string, refreshToken: string) => void;
  setUser: (user: User) => void;
  clearAuth: () => void;
  setLoading: (isLoading: boolean) => void;
  setError: (error: string | null) => void;
}

export const useAdminAuthStore = create<AdminAuthState>((set) => ({
  user: null,
  accessToken: localStorage.getItem('shaddad_admin_access_token'),
  refreshToken: localStorage.getItem('shaddad_admin_refresh_token'),
  isAuthenticated: Boolean(localStorage.getItem('shaddad_admin_access_token')),
  isLoading: false,
  error: null,

  setAuth: (user, accessToken, refreshToken) => {
    localStorage.setItem('shaddad_admin_access_token', accessToken);
    localStorage.setItem('shaddad_admin_refresh_token', refreshToken);
    set({
      user,
      accessToken,
      refreshToken,
      isAuthenticated: true,
      error: null,
    });
  },

  setUser: (user) => set({ user }),

  clearAuth: () => {
    localStorage.removeItem('shaddad_admin_access_token');
    localStorage.removeItem('shaddad_admin_refresh_token');
    set({
      user: null,
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,
      error: null,
    });
  },

  setLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error }),
}));
