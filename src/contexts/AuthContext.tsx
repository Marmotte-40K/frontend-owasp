
import React, { createContext, useContext, useState, useEffect } from 'react';
import { toast } from 'sonner';

interface User {
  id: string;
  email: string;
  name: string;
  twoFactorEnabled: boolean;
  loginAttempts: number;
  lastLogin?: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string, twoFactorCode?: string) => Promise<boolean>;
  register: (email: string, password: string, name: string) => Promise<boolean>;
  logout: () => void;
  logoutAllDevices: () => void;
  enable2FA: () => Promise<string>; // Returns QR code URL
  verify2FA: (code: string) => boolean;
  refreshToken: () => Promise<boolean>;
  updateProfile: (data: Partial<User>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Simulate token refresh
  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      // Simulate token validation
      const userData = localStorage.getItem('userData');
      if (userData) {
        setUser(JSON.parse(userData));
        setIsAuthenticated(true);
      }
    }
  }, []);

  // Simulate auto token refresh
  useEffect(() => {
    if (isAuthenticated) {
      const interval = setInterval(() => {
        refreshToken();
      }, 14 * 60 * 1000); // Refresh every 14 minutes
      return () => clearInterval(interval);
    }
  }, [isAuthenticated]);

  const login = async (email: string, password: string, twoFactorCode?: string): Promise<boolean> => {
    console.log('🔐 Login attempt:', { email, timestamp: new Date().toISOString() });

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Mock user data
    const mockUser: User = {
      id: '1',
      email,
      name: email.split('@')[0],
      twoFactorEnabled: false,
      loginAttempts: 0,
      lastLogin: new Date().toISOString()
    };

    // Simulate successful login
    localStorage.setItem('accessToken', 'mock_access_token_' + Date.now());
    localStorage.setItem('refreshToken', 'mock_refresh_token_' + Date.now());
    localStorage.setItem('userData', JSON.stringify(mockUser));

    setUser(mockUser);
    setIsAuthenticated(true);

    console.log('✅ Login successful:', { userId: mockUser.id, timestamp: new Date().toISOString() });
    toast.success('Login effettuato con successo!');

    return true;
  };

  const register = async (email: string, password: string, name: string): Promise<boolean> => {
    console.log('📝 Registration attempt:', { email, name, timestamp: new Date().toISOString() });

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));

    const mockUser: User = {
      id: Date.now().toString(),
      email,
      name,
      twoFactorEnabled: false,
      loginAttempts: 0
    };

    localStorage.setItem('userData', JSON.stringify(mockUser));

    console.log('✅ Registration successful:', { userId: mockUser.id, timestamp: new Date().toISOString() });
    toast.success('Registrazione completata! Ora puoi effettuare il login.');

    return true;
  };

  const logout = () => {
    console.log('🚪 Logout:', { userId: user?.id, timestamp: new Date().toISOString() });

    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('userData');

    setUser(null);
    setIsAuthenticated(false);

    toast.success('Logout effettuato con successo!');
  };

  const logoutAllDevices = () => {
    console.log('🚪 Logout from all devices:', { userId: user?.id, timestamp: new Date().toISOString() });

    // Simulate invalidating all tokens
    logout();
    toast.success('Logout effettuato da tutti i dispositivi!');
  };

  const enable2FA = async (): Promise<string> => {
    console.log('🔐 2FA enabled:', { userId: user?.id, timestamp: new Date().toISOString() });

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 500));

    if (user) {
      const updatedUser = { ...user, twoFactorEnabled: true };
      setUser(updatedUser);
      localStorage.setItem('userData', JSON.stringify(updatedUser));
    }

    // Return mock QR code URL
    return 'otpauth://totp/Antonio2Musitelli:' + user?.email + '?secret=JBSWY3DPEHPK3PXP&issuer=Antonio2Musitelli';
  };

  const verify2FA = (code: string): boolean => {
    console.log('🔐 2FA verification:', { userId: user?.id, code: '***', timestamp: new Date().toISOString() });

    // Mock verification (accept 123456)
    return code === '123456';
  };

  const refreshToken = async (): Promise<boolean> => {
    console.log('🔄 Token refresh:', { userId: user?.id, timestamp: new Date().toISOString() });

    const refreshToken = localStorage.getItem('refreshToken');
    if (!refreshToken) {
      logout();
      return false;
    }

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 100));

    // Generate new tokens
    localStorage.setItem('accessToken', 'mock_access_token_' + Date.now());

    return true;
  };

  const updateProfile = (data: Partial<User>) => {
    if (user) {
      const updatedUser = { ...user, ...data };
      setUser(updatedUser);
      localStorage.setItem('userData', JSON.stringify(updatedUser));
      console.log('👤 Profile updated:', { userId: user.id, changes: Object.keys(data), timestamp: new Date().toISOString() });
    }
  };

  const value: AuthContextType = {
    user,
    isAuthenticated,
    login,
    register,
    logout,
    logoutAllDevices,
    enable2FA,
    verify2FA,
    refreshToken,
    updateProfile
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
