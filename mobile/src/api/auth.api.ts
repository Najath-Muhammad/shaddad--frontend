import { apiClient } from './client.js';
import { ApiResponse, AuthResponse, User } from '../types/auth.types.js';

export interface RegisterCustomerPayload {
  fullName: string;
  phoneNumber: string;
  email?: string;
  password: string;
}

export interface RegisterDriverPayload {
  fullName: string;
  phoneNumber: string;
  email?: string;
  password: string;
  nationalIdNumber?: string;
  licenseNumber?: string;
}

export interface LoginPayload {
  identifier: string;
  password: string;
  expectedRole?: 'CUSTOMER' | 'DRIVER' | 'ADMIN';
}

export const authApi = {
  registerCustomer: async (payload: RegisterCustomerPayload): Promise<AuthResponse> => {
    const response = await apiClient.post<ApiResponse<AuthResponse>>(
      '/auth/register',
      payload
    );
    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.error?.message || 'Customer registration failed');
    }
    return response.data.data;
  },

  registerDriver: async (payload: RegisterDriverPayload): Promise<AuthResponse> => {
    const response = await apiClient.post<ApiResponse<AuthResponse>>(
      '/auth/register/driver',
      payload
    );
    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.error?.message || 'Driver registration failed');
    }
    return response.data.data;
  },

  login: async (payload: LoginPayload): Promise<AuthResponse> => {
    const response = await apiClient.post<ApiResponse<AuthResponse>>(
      '/auth/login',
      payload
    );
    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.error?.message || 'Login failed');
    }
    return response.data.data;
  },

  getCurrentUser: async (): Promise<User> => {
    const response = await apiClient.get<ApiResponse<User>>('/auth/me');
    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.error?.message || 'Failed to fetch user profile');
    }
    return response.data.data;
  },

  logout: async (refreshToken: string): Promise<void> => {
    await apiClient.post<ApiResponse<null>>('/auth/logout', { refreshToken });
  },
};
