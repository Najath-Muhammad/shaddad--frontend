import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import { Platform } from 'react-native';

const PROD_API_URL = 'https://shaddad-api.onrender.com/api/v1';

// For physical devices, use your PC's local network IP
// Android emulator: 10.0.2.2 | iOS simulator: localhost | Physical device: LAN IP
const LOCAL_IP = '192.168.220.41';
const DEFAULT_URL = __DEV__
  ? Platform.select({
      android: `http://${LOCAL_IP}:5000/api/v1`,
      ios: `http://${LOCAL_IP}:5000/api/v1`,
      default: `http://localhost:5000/api/v1`,
    })
  : PROD_API_URL;

let currentAccessToken: string | null = null;
let currentRefreshToken: string | null = null;
let onTokenRefreshSuccess: ((accessToken: string, refreshToken: string) => void) | null = null;
let onTokenRefreshFailure: (() => void) | null = null;

export const tokenManager = {
  setTokens: (accessToken: string | null, refreshToken: string | null) => {
    currentAccessToken = accessToken;
    currentRefreshToken = refreshToken;
  },
  getAccessToken: () => currentAccessToken,
  getRefreshToken: () => currentRefreshToken,
  setCallbacks: (
    onSuccess: (accessToken: string, refreshToken: string) => void,
    onFailure: () => void
  ) => {
    onTokenRefreshSuccess = onSuccess;
    onTokenRefreshFailure = onFailure;
  },
};

export const apiClient = axios.create({
  baseURL: DEFAULT_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 60000, // 60s to handle Render cold start
});

// Request interceptor: injects token
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = tokenManager.getAccessToken();
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor: handles 401 & token refresh
let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value?: unknown) => void;
  reject: (reason?: unknown) => void;
}> = [];

const processQueue = (error: unknown = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve();
    }
  });
  failedQueue = [];
};

apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & {
      _retry?: boolean;
    };

    if (error.response?.status === 401 && !originalRequest._retry) {
      if (
        originalRequest.url?.includes('/auth/login') ||
        originalRequest.url?.includes('/auth/refresh')
      ) {
        return Promise.reject(error);
      }

      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then(() => apiClient(originalRequest))
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      const refreshToken = tokenManager.getRefreshToken();
      if (!refreshToken) {
        tokenManager.setTokens(null, null);
        if (onTokenRefreshFailure) onTokenRefreshFailure();
        return Promise.reject(error);
      }

      try {
        const { data } = await axios.post(`${DEFAULT_URL}/auth/refresh`, {
          refreshToken,
        });

        const newAccessToken = data.data.accessToken;
        const newRefreshToken = data.data.refreshToken;

        tokenManager.setTokens(newAccessToken, newRefreshToken);
        if (onTokenRefreshSuccess) {
          onTokenRefreshSuccess(newAccessToken, newRefreshToken);
        }

        if (originalRequest.headers) {
          originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        }

        processQueue(null);
        return apiClient(originalRequest);
      } catch (refreshErr) {
        processQueue(refreshErr);
        tokenManager.setTokens(null, null);
        if (onTokenRefreshFailure) onTokenRefreshFailure();
        return Promise.reject(refreshErr);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

