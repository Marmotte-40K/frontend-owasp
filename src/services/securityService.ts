import { apiMethods } from '../lib/api';

// Security and monitoring service
export interface SecurityEvent {
  id: string;
  userId: number;
  eventType: 'login' | 'logout' | 'failed_login' | 'password_change' | 'totp_enable' | 'totp_disable' | 'sensitive_data_access';
  timestamp: string;
  ipAddress: string;
  userAgent: string;
  details?: Record<string, unknown>;
}

export interface ActivityLog {
  id: string;
  userId: number;
  action: string;
  resource: string;
  timestamp: string;
  ipAddress: string;
  success: boolean;
  details?: string;
}

export interface SecuritySettings {
  twoFactorEnabled: boolean;
  passwordLastChanged: string;
  accountLocked: boolean;
  lockedUntil?: string;
  failedLoginAttempts: number;
  notificationsEnabled: boolean;
}

export interface PasswordChangeRequest {
  currentPassword: string;
  newPassword: string;
  totpCode?: string; // Required if 2FA is enabled
}

export interface ActiveSession {
  id: string;
  deviceInfo: string;
  ipAddress: string;
  lastActivity: string;
  current: boolean;
}

export interface SecurityAlert {
  id: string;
  type: 'suspicious_login' | 'new_device' | 'password_change' | 'data_access';
  message: string;
  timestamp: string;
  severity: 'low' | 'medium' | 'high';
  acknowledged: boolean;
}

export const securityService = {
  // Get user's security settings
  getSecuritySettings: async (userId: number): Promise<SecuritySettings> => {
    const response = await apiMethods.get<SecuritySettings>(`/users/${userId}/security/settings`);
    return response.data;
  },

  // Update security settings
  updateSecuritySettings: async (userId: number, settings: Partial<SecuritySettings>): Promise<void> => {
    await apiMethods.put(`/users/${userId}/security/settings`, settings);
  },

  // Change password with security checks
  changePassword: async (userId: number, request: PasswordChangeRequest): Promise<void> => {
    await apiMethods.post(`/users/${userId}/security/change-password`, request);
  },

  // Get user's activity logs
  getActivityLogs: async (userId: number, limit: number = 50): Promise<ActivityLog[]> => {
    const response = await apiMethods.get<ActivityLog[]>(`/users/${userId}/security/activity`, {
      params: { limit }
    });
    return response.data;
  },

  // Get security events for user
  getSecurityEvents: async (userId: number, limit: number = 20): Promise<SecurityEvent[]> => {
    const response = await apiMethods.get<SecurityEvent[]>(`/users/${userId}/security/events`, {
      params: { limit }
    });
    return response.data;
  },

  // Get security alerts
  getSecurityAlerts: async (userId: number): Promise<SecurityAlert[]> => {
    const response = await apiMethods.get<SecurityAlert[]>(`/users/${userId}/security/alerts`);
    return response.data;
  },

  // Acknowledge security alert
  acknowledgeAlert: async (userId: number, alertId: string): Promise<void> => {
    await apiMethods.post(`/users/${userId}/security/alerts/${alertId}/acknowledge`);
  },

  // Report suspicious activity
  reportSuspiciousActivity: async (userId: number, details: string): Promise<void> => {
    await apiMethods.post(`/users/${userId}/security/report`, { details });
  },

  // Get session information
  getActiveSessions: async (userId: number): Promise<ActiveSession[]> => {
    const response = await apiMethods.get<ActiveSession[]>(`/users/${userId}/security/sessions`);
    return response.data;
  },

  // Terminate specific session
  terminateSession: async (userId: number, sessionId: string): Promise<void> => {
    await apiMethods.delete(`/users/${userId}/security/sessions/${sessionId}`);
  },

  // Terminate all sessions (logout from all devices)
  terminateAllSessions: async (userId: number): Promise<void> => {
    await apiMethods.post(`/users/${userId}/security/sessions/terminate-all`);
  },

  // Check if device is trusted
  checkDeviceTrust: async (): Promise<boolean> => {
    try {
      const response = await apiMethods.get<{ trusted: boolean }>('/security/device-trust');
      return response.data.trusted;
    } catch {
      return false;
    }
  },

  // Mark current device as trusted
  trustDevice: async (deviceName?: string): Promise<void> => {
    await apiMethods.post('/security/trust-device', { deviceName });
  },

  // Security validation utilities
  validation: {
    // Check password strength
    checkPasswordStrength: (password: string): {
      score: number;
      feedback: string[];
      isStrong: boolean;
    } => {
      const feedback: string[] = [];
      let score = 0;

      // Length check
      if (password.length >= 8) score += 1;
      else feedback.push('Password should be at least 8 characters long');

      if (password.length >= 12) score += 1;

      // Character variety checks
      if (/[a-z]/.test(password)) score += 1;
      else feedback.push('Include lowercase letters');

      if (/[A-Z]/.test(password)) score += 1;
      else feedback.push('Include uppercase letters');

      if (/\d/.test(password)) score += 1;
      else feedback.push('Include numbers');

      if (/[^a-zA-Z\d]/.test(password)) score += 1;
      else feedback.push('Include special characters');

      // Common patterns
      if (!/(.)\1{2,}/.test(password)) score += 1;
      else feedback.push('Avoid repeating characters');

      if (!/^.*(123|abc|qwe|password).*$/i.test(password)) score += 1;
      else feedback.push('Avoid common patterns');

      return {
        score,
        feedback,
        isStrong: score >= 6
      };
    },

    // Validate email format
    validateEmail: (email: string): boolean => {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      return emailRegex.test(email);
    },

    // Validate TOTP code format
    validateTOTPCode: (code: string): boolean => {
      return /^\d{6}$/.test(code);
    }
  }
};
