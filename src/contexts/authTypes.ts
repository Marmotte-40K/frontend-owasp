export interface User {
  id: number;
  email: string;
  name: string;
  surname: string;
  totpEnabled: boolean;
}

export interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string, totpCode?: string) => Promise<{ success: boolean; requiresTOTP?: boolean; error?: string }>;
  register: (email: string, password: string, name: string, surname: string) => Promise<boolean>;
  logout: () => void;
  logoutFromAllDevices: () => Promise<void>;
  refreshToken: () => Promise<boolean>;
  changePassword: (currentPassword: string, newPassword: string, twoFactorCode?: string, twoFactorMethod?: string) => Promise<{ success: boolean; error?: string }>;
}
