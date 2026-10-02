import { create } from 'zustand';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';
import { User, UserRole } from '../types/auth.types';
import { tokenManager } from '../api/client';

const ACCESS_KEY = 'shaddad_mobile_access_token';
const REFRESH_KEY = 'shaddad_mobile_refresh_token';
const APP_MODE_KEY = 'shaddad_mobile_app_mode';

const storage = {
  getItem: async (key: string): Promise<string | null> => {
    if (Platform.OS === 'web') {
      try {
        return localStorage.getItem(key);
      } catch {
        return null;
      }
    }
    try {
      return await SecureStore.getItemAsync(key);
    } catch {
      return null;
    }
  },
  setItem: async (key: string, value: string): Promise<void> => {
    if (Platform.OS === 'web') {
      try {
        localStorage.setItem(key, value);
      } catch {}
      return;
    }
    try {
      await SecureStore.setItemAsync(key, value);
    } catch {}
  },
  deleteItem: async (key: string): Promise<void> => {
    if (Platform.OS === 'web') {
      try {
        localStorage.removeItem(key);
      } catch {}
      return;
    }
    try {
      await SecureStore.deleteItemAsync(key);
    } catch {}
  },
};

interface AuthState {
  appMode: 'CUSTOMER' | 'DRIVER' | null;
  user: User | null;
  activeRole: UserRole | null;
  isAuthenticated: boolean;
  isInitializing: boolean;
  isLoading: boolean;
  error: string | null;
  initialize: () => Promise<void>;
  setAuth: (user: User, accessToken: string, refreshToken: string, mode: 'CUSTOMER' | 'DRIVER') => Promise<void>;
  updateTokens: (accessToken: string, refreshToken: string) => Promise<void>;
  setUser: (user: User) => void;
  clearAuth: () => Promise<void>;
  setLoading: (isLoading: boolean) => void;
  setError: (error: string | null) => void;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  activeRole: null,
  appMode: null,
  isAuthenticated: false,
  isInitializing: true,
  isLoading: false,
  error: null,

  initialize: async () => {
    try {
      const accessToken = await storage.getItem(ACCESS_KEY);
      const refreshToken = await storage.getItem(REFRESH_KEY);
      const appMode = (await storage.getItem(APP_MODE_KEY)) as 'CUSTOMER' | 'DRIVER' | null;

      if (accessToken && refreshToken) {
        tokenManager.setTokens(accessToken, refreshToken);
        tokenManager.setCallbacks(
          (newAccess, newRefresh) => {
            void get().updateTokens(newAccess, newRefresh);
          },
          () => {
            void get().clearAuth();
          }
        );
        set({ isAuthenticated: true, isInitializing: false, appMode });
      } else {
        tokenManager.setTokens(null, null);
        set({ isAuthenticated: false, isInitializing: false });
      }
    } catch {
      set({ isAuthenticated: false, isInitializing: false });
    }
  },

  setAuth: async (user, accessToken, refreshToken, mode) => {
    await storage.setItem(APP_MODE_KEY, mode);
    await storage.setItem(ACCESS_KEY, accessToken);
    await storage.setItem(REFRESH_KEY, refreshToken);
    tokenManager.setTokens(accessToken, refreshToken);
    tokenManager.setCallbacks(
      (newAccess, newRefresh) => {
        void get().updateTokens(newAccess, newRefresh);
      },
      () => {
        void get().clearAuth();
      }
    );

    set({
      user,
      activeRole: user.role,
      appMode: mode,
      isAuthenticated: true,
      error: null,
    });
  },

  updateTokens: async (accessToken, refreshToken) => {
    await storage.setItem(ACCESS_KEY, accessToken);
    await storage.setItem(REFRESH_KEY, refreshToken);
    tokenManager.setTokens(accessToken, refreshToken);
  },

  setUser: (user) => {
    set({ user, activeRole: user.role });
  },

  clearAuth: async () => {
    await storage.deleteItem(ACCESS_KEY);
    await storage.deleteItem(APP_MODE_KEY);
    await storage.deleteItem(REFRESH_KEY);
    tokenManager.setTokens(null, null);

    set({
      user: null,
      activeRole: null,
  appMode: null,
      isAuthenticated: false,
      error: null,
    });
  },

  setLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error }),
}));


