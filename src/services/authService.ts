import api, { apiMethods } from '../lib/api';

// API Request/Response interfaces based on your backend schema
export interface LoginRequest {
  email: string;
  password: string;
  totp_code?: string; // Optional TOTP code for 2FA
}

export interface RegisterRequest {
  email: string;
  password: string;
  surname: string;
  name: string;
}

export interface AuthTokenResponse {
  access_token: string;
  refresh_token	: string;
  token_type: string;
  expires_in: number; // Access token expiration in seconds
}

export interface TOTPRequiredResponse {
  error: string;
  totp_required: boolean;
}

export interface AccountLockedResponse {
  error: string;
  locked_until: string;
}

export interface UserResponse {
  email: string;
  id: number;
  name: string;
  surname: string;
  totp_enabled: boolean;
}

export interface SensitiveDataRequest {
  iban?: string;
  fiscal_code?: string;
}

export interface SensitiveDataResponse {
  iban?: string;
  fiscal_code?: string;
}

// 2FA Method Types
export type TwoFactorMethod = 'totp' | 'email' | 'sms';

// 2FA Setup and Management
export interface TwoFactorSetupRequest {
  method: TwoFactorMethod;
  phone_number?: string; // Required for SMS
}

export interface TwoFactorSetupResponse {
  method: TwoFactorMethod;
  qr_code?: string; // For TOTP method
  secret?: string; // For TOTP method
  manual_entry_key?: string; // For TOTP method
  backup_codes?: string[]; // Recovery codes
}

export interface TwoFactorVerificationRequest {
  method: TwoFactorMethod;
  code: string;
  setup_token?: string; // For setup verification
}

export interface TwoFactorVerificationResponse {
  verified: boolean;
  backup_codes?: string[]; // Only returned during setup
}

// Password Change with 2FA
export interface ChangePasswordRequest {
  current_password: string;
  new_password: string;
  two_factor_code?: string;
  two_factor_method?: TwoFactorMethod;
}

// Email/SMS Code Request
export interface RequestCodeRequest {
  method: 'email' | 'sms';
  action: 'login' | 'password_change' | 'setup';
  phone_number?: string; // Required for SMS
}

export interface RequestCodeResponse {
  code_sent: boolean;
  expires_in: number; // Seconds until code expires
  method: 'email' | 'sms';
}

export interface TOTPRequest {
  totp_code: string;
}

export interface TOTPValidationResponse {
  valid: boolean;
  message: string;
}

export interface SuccessResponse {
  message: string;
}

export interface ErrorResponse {
  error: string;
}

export interface QRCodeResponse {
    manual_entry_key: string;
    qr_code: string;
    secret: string;
}

export interface SuccessResponse {
  message: string;
}

export const authService = {
  // Login user with optional TOTP
  login: async (credentials: LoginRequest): Promise<AuthTokenResponse | TOTPRequiredResponse> => {
    try {
      const response = await apiMethods.post<AuthTokenResponse>('/auth/login', credentials);
      return response.data;
    } catch (error: unknown) {
      // Handle specific error cases
      if (error && typeof error === 'object' && 'response' in error) {
        const axiosError = error as { response: { status: number; data: unknown } };
        if (axiosError.response?.status === 422) {
          // TOTP required
          return axiosError.response.data as TOTPRequiredResponse;
        } else if (axiosError.response?.status === 423) {
          // Account locked
          throw axiosError.response.data as AccountLockedResponse;
        }
      }
      throw error;
    }
  },

  // Register new user
  register: async (userData: RegisterRequest): Promise<UserResponse> => {
    const response = await apiMethods.post<UserResponse>('/auth/register', userData);
    return response.data;
  },

  // Logout user and invalidate refresh token
  logout: async (): Promise<SuccessResponse> => {
    const response = await apiMethods.post<SuccessResponse>('/auth/logout');
    return response.data;
  },

  // Change password with 2FA support
  changePassword: async (data: ChangePasswordRequest): Promise<SuccessResponse> => {
    const response = await apiMethods.post<SuccessResponse>('/auth/change-password', data);
    return response.data;
  },

  // Request 2FA code via email or SMS
  requestTwoFactorCode: async (data: RequestCodeRequest): Promise<RequestCodeResponse> => {
    const response = await apiMethods.post<RequestCodeResponse>('/auth/2fa/request-code', data);
    return response.data;
  },

  // Refresh access token using refresh token from cookies
  refreshToken: async (): Promise<AuthTokenResponse> => {
    const response = await apiMethods.post<AuthTokenResponse>('/auth/refresh');
    return response.data;
  },

  // Get current user data (placeholder for your API implementation)
  getCurrentUser: async (): Promise<UserResponse> => {
    // TODO: Replace '/auth/user' with your actual API endpoint path
    // const response = await apiMethods.get<UserResponse>('/auth/user');
    // return response.data;
    
    // For now, throw an error to indicate this isn't implemented yet
    throw new Error('getCurrentUser API not implemented yet');
  },

  // Get sensitive data for a user
  getSensitiveData: async (userId: number): Promise<SensitiveDataResponse> => {
    const response = await apiMethods.get<SensitiveDataResponse>(`/users/${userId}/sensitive`);
    return response.data;
  },

  // Save or update sensitive data
  saveSensitiveData: async (userId: number, data: SensitiveDataRequest): Promise<SuccessResponse> => {
    const response = await apiMethods.post<SuccessResponse>(`/users/${userId}/sensitive`, data);
    return response.data;
  },

  // Update sensitive data
  updateSensitiveData: async (userId: number, data: SensitiveDataRequest): Promise<SuccessResponse> => {
    const response = await apiMethods.put<SuccessResponse>(`/users/${userId}/sensitive`, data);
    return response.data;
  },

  // Two-Factor Authentication (2FA) methods
  twoFactor: {
    // Setup 2FA (TOTP, Email, or SMS)
    setup: async (userId: number, data: TwoFactorSetupRequest): Promise<TwoFactorSetupResponse> => {
      const response = await apiMethods.post<TwoFactorSetupResponse>(`/users/${userId}/2fa/setup`, data);
      return response.data;
    },

    // Verify 2FA code during setup
    verifySetup: async (userId: number, data: TwoFactorVerificationRequest): Promise<TwoFactorVerificationResponse> => {
      const response = await apiMethods.post<TwoFactorVerificationResponse>(`/users/${userId}/2fa/verify-setup`, data);
      return response.data;
    },

    // Enable 2FA after successful setup
    enable: async (userId: number, method: TwoFactorMethod): Promise<SuccessResponse> => {
      const response = await apiMethods.post<SuccessResponse>(`/users/${userId}/2fa/enable`, { method });
      return response.data;
    },

    // Disable 2FA
    disable: async (userId: number, data: TwoFactorVerificationRequest): Promise<SuccessResponse> => {
      const response = await apiMethods.post<SuccessResponse>(`/users/${userId}/2fa/disable`, data);
      return response.data;
    },

    // Verify 2FA code for login or password change
    verify: async (userId: number, data: TwoFactorVerificationRequest): Promise<TwoFactorVerificationResponse> => {
      const response = await apiMethods.post<TwoFactorVerificationResponse>(`/users/${userId}/2fa/verify`, data);
      return response.data;
    },

    // Get user's 2FA methods
    getMethods: async (userId: number): Promise<{ methods: TwoFactorMethod[]; primary: TwoFactorMethod | null }> => {
      const response = await apiMethods.get<{ methods: TwoFactorMethod[]; primary: TwoFactorMethod | null }>(`/users/${userId}/2fa/methods`);
      return response.data;
    },

    // Legacy TOTP methods for backward compatibility
    totp: {
      // Get QR code for TOTP setup
      getQRCode: async (userId: number): Promise<QRCodeResponse> => {
        const response = await apiMethods.get<QRCodeResponse>(`/users/${userId}/totp/qr`);
        return response.data;
      },

      // Enable TOTP for user
      enable: async (userId: number, code: string): Promise<TOTPRequest> => {
        const response = await apiMethods.post<TOTPRequest>(`/users/${userId}/totp/enable`, { totp_code: code });
        return response.data;
      },

      // Disable TOTP for user
      disable: async (userId: number, code: string): Promise<SuccessResponse> => {
        const response = await apiMethods.post<SuccessResponse>(`/users/${userId}/totp/disable`, { code });
        return response.data;
      },

      // Verify TOTP code
      verify: async (userId: number, code: string): Promise<TOTPValidationResponse> => {
        const response = await apiMethods.post<TOTPValidationResponse>(`/users/${userId}/totp/verify`, { totp_code: code });
        return response.data;
      },
    },
  },

  // Check if user is authenticated by testing the refresh token
  // Since cookies are HTTP-only, we can't read them directly
  // We'll try to refresh the token to see if we're authenticated
  verifyAuth: async (): Promise<boolean> => {
    try {
      console.log('🔄 Verifying authentication...');
      // Try to refresh the token - if it works, we're authenticated
      await apiMethods.post<AuthTokenResponse>('/auth/refresh');
      console.log('✅ Auth verification successful');
      return true;
    } catch (error) {
      console.log('❌ Auth verification failed:', error);
      // If refresh fails, we're not authenticated or session expired
      return false;
    }
  },
};
