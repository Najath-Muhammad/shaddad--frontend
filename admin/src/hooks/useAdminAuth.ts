import { useState, useCallback } from 'react';
import { useAdminAuthStore } from '../store/adminAuthStore.js';
import { adminAuthApi, AdminLoginPayload } from '../api/auth.api.js';

export const useAdminAuth = () => {
  const {
    user,
    isAuthenticated,
    isLoading: storeLoading,
    error: storeError,
    setAuth,
    setUser,
    clearAuth,
    setLoading,
    setError,
  } = useAdminAuthStore();

  const [isActionLoading, setIsActionLoading] = useState(false);

  const login = useCallback(
    async (payload: AdminLoginPayload) => {
      setIsActionLoading(true);
      setError(null);
      try {
        const { user: loggedInUser, tokens } = await adminAuthApi.login(payload);
        setAuth(loggedInUser, tokens.accessToken, tokens.refreshToken);
        return loggedInUser;
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : 'Login failed';
        setError(message);
        throw err;
      } finally {
        setIsActionLoading(false);
      }
    },
    [setAuth, setError]
  );

  const loadProfile = useCallback(async () => {
    setLoading(true);
    try {
      const admin = await adminAuthApi.getCurrentAdmin();
      setUser(admin);
      return admin;
    } catch {
      clearAuth();
      return null;
    } finally {
      setLoading(false);
    }
  }, [clearAuth, setLoading, setUser]);

  const logout = useCallback(async () => {
    const refreshToken = localStorage.getItem('shaddad_admin_refresh_token');
    if (refreshToken) {
      try {
        await adminAuthApi.logout(refreshToken);
      } catch {
        // Idempotent logout
      }
    }
    clearAuth();
  }, [clearAuth]);

  return {
    user,
    isAuthenticated,
    isLoading: storeLoading || isActionLoading,
    error: storeError,
    login,
    loadProfile,
    logout,
  };
};
