import { apiClient } from './client';
import { ApiResponse, User, Vehicle, DriverAvailability } from '../../../shared/types/auth.types';

type VehicleTypeValue =
  | 'DYNA'
  | 'PICKUP_SMALL'
  | 'PICKUP_LARGE'
  | 'TRAILER'
  | 'FLATBED'
  | 'REFRIGERATED'
  | 'BOX_TRUCK';

export interface CreateVehiclePayload {
  vehicleType: VehicleTypeValue;
  make: string;
  model: string;
  year: number;
  plateNumber: string;
  color: string;
  maxWeightKg: number;
  maxLengthCm?: number;
  isRefrigerated?: boolean;
}

export interface DriverProfile {
  id: string;
  nationalIdFrontUrl: string | null;
  nationalIdBackUrl: string | null;
  licenseUrl: string | null;
  profilePhotoUrl: string | null;
  verificationStatus: 'PENDING_VERIFICATION' | 'APPROVED' | 'REJECTED' | 'SUSPENDED';
  rejectionReason: string | null;
  suspensionReason: string | null;
  availability: 'OFFLINE' | 'ONLINE' | 'BUSY';
  rating: number;
  walletBalance: string | number;
  totalTripsCount: number;
  vehicle: {
    registrationUrl: string | null;
    insuranceUrl: string | null;
    vehiclePhotoUrl: string | null;
  } | null;
}

export const driverApi = {
  getProfile: async (): Promise<ApiResponse<User>> => {
    const res = await apiClient.get<ApiResponse<User>>('/drivers/profile');
    return res.data;
  },

  getDriverProfile: async (): Promise<ApiResponse<DriverProfile>> => {
    const res = await apiClient.get<ApiResponse<DriverProfile>>('/drivers/profile');
    return res.data;
  },

  createVehicle: async (vehicleData: CreateVehiclePayload): Promise<ApiResponse<Vehicle>> => {
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
