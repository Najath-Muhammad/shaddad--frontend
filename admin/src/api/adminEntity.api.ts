import { apiClient } from './client';

export const adminEntityApi = {
  getCustomers: async () => {
    const res = await apiClient.get('/admin/customers');
    return res.data;
  },
  getDrivers: async () => {
    const res = await apiClient.get('/admin/drivers');
    return res.data;
  },
  getTrips: async () => {
    const res = await apiClient.get('/admin/trips');
    return res.data;
  },
  toggleUserBlock: async (userId: string) => {
    const res = await apiClient.post(`/admin/users/${userId}/toggle-block`);
    return res.data;
  },
  getDriverRatingHistory: async (driverProfileId: string) => {
    const res = await apiClient.get(`/admin/drivers/${driverProfileId}/rating-history`);
    return res.data;
  }
};
