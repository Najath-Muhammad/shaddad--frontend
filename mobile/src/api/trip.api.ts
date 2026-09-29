import { apiClient } from './client';

export const tripApi = {
  calculatePrice: async (data: any) => {
    return apiClient.post('/customers/trips/calculate-price', data);
  },
  createTrip: async (data: any) => {
    return apiClient.post('/customers/trips', data);
  },
  getTrip: async (tripId: string) => {
    return apiClient.get(`/customers/trips/${tripId}`);
  },
  getIncomingRequests: async () => {
    return apiClient.get('/drivers/trips/incoming');
  },
  respondToTrip: async (tripId: string, accept: boolean, reason?: string) => {
    return apiClient.post(`/drivers/trips/${tripId}/respond`, { accept, reason });
  }
};
