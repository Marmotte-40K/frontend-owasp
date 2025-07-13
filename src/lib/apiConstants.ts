// API endpoints and error handling utilities
export const API_ENDPOINTS = {
  // Authentication endpoints
  AUTH: {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    LOGOUT: '/auth/logout',
    REFRESH: '/auth/refresh',
  },
  
  // User endpoints
  USERS: {
    SENSITIVE_DATA: (userId: number) => `/users/${userId}/sensitive`,
    TOTP: {
      QR: (userId: number) => `/users/${userId}/totp/qr`,
      ENABLE: (userId: number) => `/users/${userId}/totp/enable`,
      DISABLE: (userId: number) => `/users/${userId}/totp/disable`,
      VERIFY: (userId: number) => `/users/${userId}/totp/verify`,
    },
    SECURITY: {
      SETTINGS: (userId: number) => `/users/${userId}/security/settings`,
      CHANGE_PASSWORD: (userId: number) => `/users/${userId}/security/change-password`,
      ACTIVITY: (userId: number) => `/users/${userId}/security/activity`,
      EVENTS: (userId: number) => `/users/${userId}/security/events`,
      ALERTS: (userId: number) => `/users/${userId}/security/alerts`,
      ACKNOWLEDGE_ALERT: (userId: number, alertId: string) => `/users/${userId}/security/alerts/${alertId}/acknowledge`,
      REPORT: (userId: number) => `/users/${userId}/security/report`,
      SESSIONS: (userId: number) => `/users/${userId}/security/sessions`,
      TERMINATE_SESSION: (userId: number, sessionId: string) => `/users/${userId}/security/sessions/${sessionId}`,
      TERMINATE_ALL: (userId: number) => `/users/${userId}/security/sessions/terminate-all`,
    }
  },
  
  // Security endpoints
  SECURITY: {
    DEVICE_TRUST: '/security/device-trust',
    TRUST_DEVICE: '/security/trust-device',
  }
} as const;

// HTTP Status codes for better error handling
export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  UNPROCESSABLE_ENTITY: 422,
  LOCKED: 423,
  INTERNAL_SERVER_ERROR: 500,
} as const;

// Error types for better error handling
export type APIError = {
  status: number;
  message: string;
  code?: string;
  details?: unknown;
};

// Error handler utility
export const handleAPIError = (error: unknown): APIError => {
  if (error && typeof error === 'object' && 'response' in error) {
    const axiosError = error as {
      response: {
        status: number;
        data: {
          error?: string;
          message?: string;
          code?: string;
        };
      };
    };

    return {
      status: axiosError.response.status,
      message: axiosError.response.data.message || axiosError.response.data.error || 'An error occurred',
      code: axiosError.response.data.code,
      details: axiosError.response.data,
    };
  }

  // Network or other errors
  return {
    status: 0,
    message: 'Network error or unknown error occurred',
  };
};

// Security validation utilities
export const SecurityValidation = {
  // Password strength requirements
  PASSWORD_REQUIREMENTS: {
    minLength: 8,
    requireUppercase: true,
    requireLowercase: true,
    requireNumbers: true,
    requireSpecialChars: true,
  },

  // Validate password strength
  isPasswordStrong: (password: string): boolean => {
    const { minLength, requireUppercase, requireLowercase, requireNumbers, requireSpecialChars } = SecurityValidation.PASSWORD_REQUIREMENTS;
    
    if (password.length < minLength) return false;
    if (requireUppercase && !/[A-Z]/.test(password)) return false;
    if (requireLowercase && !/[a-z]/.test(password)) return false;
    if (requireNumbers && !/\d/.test(password)) return false;
    if (requireSpecialChars && !/[^a-zA-Z\d]/.test(password)) return false;
    
    return true;
  },

  // Validate email format
  isEmailValid: (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  },

  // Validate TOTP code format (6 digits)
  isTOTPCodeValid: (code: string): boolean => {
    return /^\d{6}$/.test(code);
  },

  // Check for common weak passwords
  isPasswordWeak: (password: string): boolean => {
    const weakPasswords = [
      'password', '123456', '123456789', 'qwerty', 'abc123',
      'password123', 'admin', 'letmein', 'welcome', 'monkey'
    ];
    
    return weakPasswords.some(weak => 
      password.toLowerCase().includes(weak.toLowerCase())
    );
  },

  // Sanitize user input for logging (remove sensitive data)
  sanitizeForLogging: (data: Record<string, unknown>): Record<string, unknown> => {
    const sensitiveFields = ['password', 'token', 'secret', 'iban', 'fiscalCode', 'creditCard'];
    const sanitized = { ...data };
    
    for (const field of sensitiveFields) {
      if (field in sanitized) {
        sanitized[field] = '[REDACTED]';
      }
    }
    
    return sanitized;
  }
};

// Rate limiting helper (client-side basic implementation)
export class RateLimiter {
  private attempts: Map<string, { count: number; resetTime: number }> = new Map();
  
  constructor(
    private maxAttempts: number = 5,
    private windowMs: number = 15 * 60 * 1000 // 15 minutes
  ) {}

  // Check if action is allowed
  isAllowed(key: string): boolean {
    const now = Date.now();
    const attempt = this.attempts.get(key);
    
    if (!attempt || now > attempt.resetTime) {
      // Reset or create new attempt record
      this.attempts.set(key, { count: 1, resetTime: now + this.windowMs });
      return true;
    }
    
    if (attempt.count >= this.maxAttempts) {
      return false;
    }
    
    attempt.count++;
    return true;
  }

  // Get remaining attempts
  getRemainingAttempts(key: string): number {
    const attempt = this.attempts.get(key);
    if (!attempt || Date.now() > attempt.resetTime) {
      return this.maxAttempts;
    }
    return Math.max(0, this.maxAttempts - attempt.count);
  }

  // Get time until reset
  getTimeUntilReset(key: string): number {
    const attempt = this.attempts.get(key);
    if (!attempt || Date.now() > attempt.resetTime) {
      return 0;
    }
    return attempt.resetTime - Date.now();
  }

  // Clear attempts for a key
  clearAttempts(key: string): void {
    this.attempts.delete(key);
  }
}

// Create rate limiter instances for different actions
export const rateLimiters = {
  login: new RateLimiter(5, 15 * 60 * 1000), // 5 attempts per 15 minutes
  passwordReset: new RateLimiter(3, 60 * 60 * 1000), // 3 attempts per hour
  totpVerification: new RateLimiter(10, 5 * 60 * 1000), // 10 attempts per 5 minutes
};

// Security headers helper
export const SecurityHeaders = {
  // Check if security headers are present (for development/testing)
  checkSecurityHeaders: (): {
    csp: boolean;
    hsts: boolean;
    xframeOptions: boolean;
    xContentTypeOptions: boolean;
  } => {
    // Note: In a real application, these would be checked server-side
    // This is just for demonstration purposes
    return {
      csp: document.querySelector('meta[http-equiv="Content-Security-Policy"]') !== null,
      hsts: false, // Can't be checked from client-side
      xframeOptions: false, // Can't be checked from client-side
      xContentTypeOptions: false, // Can't be checked from client-side
    };
  }
};
