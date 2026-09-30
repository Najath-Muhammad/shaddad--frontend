import { apiClient } from './client';

export const dashboardApi = {
  getMetrics: async () => {
    const res = await apiClient.get('/admin/metrics');
    return res.data;
  },
};
