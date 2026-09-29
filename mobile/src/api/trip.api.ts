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
  getCustomerTrips: async () => {
    return apiClient.get('/customers/trips');
  },
  getDriverTrips: async () => {
    return apiClient.get('/drivers/trips');
  },
  getIncomingRequests: async () => {
    return apiClient.get('/drivers/trips/incoming');
  },
  respondToTrip: async (tripId: string, accept: boolean, reason?: string) => {
    return apiClient.post(`/drivers/trips/${tripId}/respond`, { accept, reason });
  },
  updateStatus: async (tripId: string, status: string) => {
    return apiClient.patch(`/drivers/trips/${tripId}/status`, { status });
  },
  submitDeliveryProof: async (tripId: string, otp: string, photoUrl?: string) => {
    return apiClient.post(`/drivers/trips/${tripId}/deliver`, { otp, photoUrl });
  },
  confirmTestPayment: async (tripId: string) => {
    return apiClient.post(`/customers/trips/${tripId}/test-payment`, {});
  }
};
