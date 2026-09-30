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
  getDriverTrip: async (tripId: string) => {
    return apiClient.get(`/drivers/trips/${tripId}`);
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
  initiatePayment: async (tripId: string) => {
    return apiClient.post(`/payments/trips/${tripId}/initiate`);
  },
  simulatePaymentSuccess: async (tripId: string) => {
    return apiClient.post(`/payments/trips/${tripId}/simulate-success`);
  },
  submitReview: async (tripId: string, rating: number, comment?: string, role: 'CUSTOMER' | 'DRIVER' = 'CUSTOMER') => {
    const basePath = role === 'DRIVER' ? '/drivers' : '/customers';
    return apiClient.post(`${basePath}/trips/${tripId}/review`, { rating, comment });
  }
};
