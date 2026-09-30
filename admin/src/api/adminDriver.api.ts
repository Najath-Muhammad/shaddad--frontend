import { apiClient as adminApiClient } from './client';
import { ApiResponse, User } from '../../../shared/types/auth.types';

export const adminDriverApi = {
  getPendingDrivers: async (): Promise<ApiResponse<User[]>> => {
    const res = await adminApiClient.get<ApiResponse<User[]>>('/admin/drivers/pending');
    return res.data;
  },

  getDriverDossier: async (driverId: string): Promise<ApiResponse<User>> => {
    const res = await adminApiClient.get<ApiResponse<User>>(`/admin/drivers/${driverId}`);
    return res.data;
  },

  verifyDriver: async (
    driverId: string, 
    decision: 'APPROVED' | 'REJECTED' | 'SUSPENDED',
    reason?: string
  ): Promise<ApiResponse<User>> => {
    const res = await adminApiClient.post<ApiResponse<User>>(`/admin/drivers/${driverId}/verify`, {
      decision,
      reason
    });
    return res.data;
  }
};
