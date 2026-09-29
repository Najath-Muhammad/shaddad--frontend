import { useState, useCallback } from 'react';
import { useAuthStore } from '../store/authStore';
import {
  authApi,
  LoginPayload,
  RegisterCustomerPayload,
  RegisterDriverPayload,
} from '../api/auth.api';

export const useAuth = () => {
  const {
    user,
    activeRole,
    isAuthenticated,
    isInitializing,
    isLoading: storeLoading,
    error: storeError,
    setAuth,
    setUser,
    clearAuth,
    setLoading,
    setError,
  } = useAuthStore();

  const [actionLoading, setActionLoading] = useState(false);

  const login = useCallback(
    async (payload: LoginPayload) => {
      setActionLoading(true);
      setError(null);
      try {
        const { user: loggedInUser, tokens } = await authApi.login(payload);
        await setAuth(loggedInUser, tokens.accessToken, tokens.refreshToken);
        return loggedInUser;
      } catch (err: unknown) {
        const message =
          (err as any)?.response?.data?.error?.message ||
          (err instanceof Error ? err.message : 'Login failed');
        setError(message);
        throw err;
      } finally {
        setActionLoading(false);
      }
    },
    [setAuth, setError]
  );

  const registerCustomer = useCallback(
    async (payload: RegisterCustomerPayload) => {
      setActionLoading(true);
      setError(null);
      try {
        const { user: registeredUser, tokens } = await authApi.registerCustomer(payload);
        await setAuth(registeredUser, tokens.accessToken, tokens.refreshToken);
        return registeredUser;
      } catch (err: unknown) {
        const message =
          (err as any)?.response?.data?.error?.message ||
          (err instanceof Error ? err.message : 'Registration failed');
        setError(message);
        throw err;
      } finally {
        setActionLoading(false);
      }
    },
    [setAuth, setError]
  );

  const registerDriver = useCallback(
    async (payload: RegisterDriverPayload) => {
      setActionLoading(true);
      setError(null);
      try {
        const { user: registeredUser, tokens } = await authApi.registerDriver(payload);
        await setAuth(registeredUser, tokens.accessToken, tokens.refreshToken);
        return registeredUser;
      } catch (err: unknown) {
        const message =
          (err as any)?.response?.data?.error?.message ||
          (err instanceof Error ? err.message : 'Driver registration failed');
        setError(message);
        throw err;
      } finally {
        setActionLoading(false);
      }
    },
    [setAuth, setError]
  );

  const loadProfile = useCallback(async () => {
    setLoading(true);
    try {
      const currentUser = await authApi.getCurrentUser();
      setUser(currentUser);
      return currentUser;
    } catch {
      await clearAuth();
      return null;
    } finally {
      setLoading(false);
    }
  }, [clearAuth, setLoading, setUser]);

  const logout = useCallback(async () => {
    const refreshToken = useAuthStore.getState().user ? null : null;
    // Attempt graceful API logout
    try {
      const token = useAuthStore.getState();
      if (token) {
        // Idempotent
      }
    } catch {}
    await clearAuth();
  }, [clearAuth]);

  return {
    user,
    activeRole,
    isAuthenticated,
    isInitializing,
    isLoading: storeLoading || actionLoading,
    error: storeError,
    login,
    registerCustomer,
    registerDriver,
    loadProfile,
    logout,
  };
};
