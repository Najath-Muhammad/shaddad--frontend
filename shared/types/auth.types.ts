export type UserRole = 'CUSTOMER' | 'DRIVER' | 'ADMIN';

export type DriverVerificationStatus =
  | 'PENDING'
  | 'APPROVED'
  | 'REJECTED'
  | 'SUSPENDED';

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
  isOnline: boolean;
  rating: number;
  walletBalance: string;
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
