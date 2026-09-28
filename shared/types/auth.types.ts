export type UserRole = 'CUSTOMER' | 'DRIVER' | 'ADMIN';

export type DriverVerificationStatus =
  | 'PENDING_VERIFICATION'
  | 'APPROVED'
  | 'REJECTED'
  | 'SUSPENDED';

export type DriverAvailability = 'OFFLINE' | 'ONLINE' | 'BUSY';

export type VehicleType = 
  | 'DYNA'
  | 'PICKUP_SMALL'
  | 'PICKUP_LARGE'
  | 'TRAILER'
  | 'FLATBED'
  | 'REFRIGERATED'
  | 'BOX_TRUCK';

export interface Vehicle {
  id: string;
  vehicleType: VehicleType;
  make: string;
  model: string;
  year: number;
  plateNumber: string;
  color: string;
  maxWeightKg: number;
  maxLengthCm: number | null;
  isRefrigerated: boolean;
  isVerified: boolean;
  registrationUrl: string | null;
  insuranceUrl: string | null;
  vehiclePhotoUrl: string | null;
}

export interface CustomerProfile {
  id: string;
  defaultAddress: string | null;
  rating: number;
  totalTripsCount: number;
}

export interface DriverProfile {
  id: string;
  nationalIdNumber: string | null;
  licenseNumber: string | null;
  verificationStatus: DriverVerificationStatus;
  availability: DriverAvailability;
  rating: number;
  walletBalance: string;
  nationalIdFrontUrl?: string | null;
  nationalIdBackUrl?: string | null;
  licenseUrl?: string | null;
  profilePhotoUrl?: string | null;
  rejectionReason?: string | null;
  suspensionReason?: string | null;
  vehicle?: Vehicle | null;
}

export interface User {
  id: string;
  phoneNumber: string;
  email: string | null;
  fullName: string;
  role: UserRole;
  isActive: boolean;
  createdAt: string;
  customerProfile?: CustomerProfile | null;
  driverProfile?: DriverProfile | null;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  tokenType: 'Bearer';
  expiresIn: string;
}

export interface AuthResponse {
  user: User;
  tokens: AuthTokens;
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  message?: string;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: unknown;
  };
  timestamp: string;
}
