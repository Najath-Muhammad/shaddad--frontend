import { apiClient } from './client';
import { ApiResponse, User, Vehicle, DriverAvailability } from '../../../shared/types/auth.types';

export const driverApi = {
  getProfile: async (): Promise<ApiResponse<User>> => {
    const res = await apiClient.get<ApiResponse<User>>('/drivers/profile');
    return res.data;
  },

  createVehicle: async (vehicleData: Partial<Vehicle>): Promise<ApiResponse<Vehicle>> => {
    const res = await apiClient.post<ApiResponse<Vehicle>>('/drivers/vehicle', vehicleData);
    return res.data;
  },

  uploadDocuments: async (formData: FormData): Promise<ApiResponse<User>> => {
    const res = await apiClient.post<ApiResponse<User>>('/drivers/documents', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return res.data;
  },

  updateAvailability: async (availability: DriverAvailability): Promise<ApiResponse<null>> => {
    const res = await apiClient.post<ApiResponse<null>>('/drivers/availability', { availability });
    return res.data;
  },

  updateLocation: async (latitude: number, longitude: number): Promise<ApiResponse<null>> => {
    const res = await apiClient.post<ApiResponse<null>>('/drivers/location', { latitude, longitude });
    return res.data;
  },
};

export const customerDriverApi = {
  getNearbyDrivers: async (latitude: number, longitude: number, radiusKm = 10, vehicleType?: string): Promise<ApiResponse<any[]>> => {
    const params = new URLSearchParams({
      latitude: latitude.toString(),
      longitude: longitude.toString(),
      radiusKm: radiusKm.toString(),
    });
    if (vehicleType) params.append('vehicleType', vehicleType);
    
    const res = await apiClient.get<ApiResponse<any[]>>(`/customers/nearby-drivers?${params.toString()}`);
    return res.data;
  },
};
