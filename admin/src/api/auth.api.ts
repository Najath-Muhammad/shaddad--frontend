import { apiClient } from './client.js';
import { ApiResponse, AuthResponse, User } from '../types/auth.types.js';

export interface AdminLoginPayload {
  identifier: string;
  password: string;
}

export const adminAuthApi = {
  login: async (payload: AdminLoginPayload): Promise<AuthResponse> => {
    const response = await apiClient.post<ApiResponse<AuthResponse>>('/auth/login', {
      ...payload,
      expectedRole: 'ADMIN',
    });
    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.error?.message || 'Login failed');
    }
    return response.data.data;
  },

  getCurrentAdmin: async (): Promise<User> => {
    const response = await apiClient.get<ApiResponse<User>>('/auth/me');
    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.error?.message || 'Failed to get profile');
    }
    return response.data.data;
  },

  logout: async (refreshToken: string): Promise<void> => {
    await apiClient.post<ApiResponse<null>>('/auth/logout', { refreshToken });
  },
};
