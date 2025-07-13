import React, { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { authService, AuthTokenResponse, TOTPRequiredResponse, LoginRequest, RegisterRequest, UserResponse, TwoFactorMethod } from '../services/authService';
import { tokenUtils } from '../lib/cookieUtils';
import { handleAPIError } from '../lib/apiConstants';
import { User, AuthContextType } from './authTypes';
import { AuthContext } from './auth-context';
import { createMockUser, getMockAuthenticatedUser, findMockUserByEmail } from '../lib/mockData';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Check if user is authenticated on app start
  useEffect(() => {
    const checkAuth = async () => {
      setIsLoading(true);
      try {
        console.log('🔄 Checking auth on app start...');
        // Since we can't read HTTP-only cookies, we'll try to refresh the token
        // If refresh succeeds, we know we're authenticated
        const isValid = await authService.verifyAuth();
        console.log('🔍 Auth verification result:', isValid);
        
        setIsAuthenticated(isValid);
        
        if (isValid) {
          // Usa dati utente quando siamo autenticati
          const mockUser = getMockAuthenticatedUser();
          console.log('✅ Setting authenticated user:', mockUser);
          setUser(mockUser);
        } else {
          console.log('❌ User not authenticated');
          setUser(null);
        }
      } catch (error) {
        console.error('❌ Auth check error:', error);
        // If verification fails, user is not authenticated
        setIsAuthenticated(false);
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []); // Only run on component mount

  // Login function
  const login = async (email: string, password: string, totpCode?: string) => {
    try {
      console.log('🔐 Starting login process...');
      
      const credentials: LoginRequest = {
        email,
        password,
        totp_code: totpCode
      };

      console.log('📡 Sending login request...');
      const result = await authService.login(credentials);

      // Check if result is TOTP required
      if ('totp_required' in result && result.totp_required) {
        return {
          success: false,
          requiresTOTP: true,
          error: 'TOTP code required'
        };
      }

      // If we get here, it's an AuthTokenResponse
      const authResponse = result as AuthTokenResponse;
      
      // Tokens are automatically stored in HTTP-only cookies by the server
      setIsAuthenticated(true);
      
      // Prova a trovare un utente mock per email, altrimenti crea uno nuovo
      let userData = findMockUserByEmail(email);
      if (!userData) {
        // Crea mock user dai dati di login
        const nameParts = email.split('@')[0].split('.');
        userData = createMockUser(
          email,
          nameParts[0] ? nameParts[0].charAt(0).toUpperCase() + nameParts[0].slice(1) : 'User',
          nameParts[1] ? nameParts[1].charAt(0).toUpperCase() + nameParts[1].slice(1) : 'Unknown'
        );
      }
      
      // Aggiorna TOTP status se abbiamo usato un codice
      if (totpCode) {
        userData = { ...userData, totpEnabled: true };
      }
      
      console.log('✅ Setting user data:', userData);
      setUser(userData);
      
      toast.success('Login completato con successo');
      return { success: true };

    } catch (error) {
      const apiError = handleAPIError(error);
      
      if (apiError.status === 423) {
        // Account locked
        return {
          success: false,
          error: 'Account temporarily locked due to too many failed attempts'
        };
      }
      
      return {
        success: false,
        error: apiError.message || 'Login failed'
      };
    }
  };

  // Register function
  const register = async (email: string, password: string, name: string, surname: string): Promise<boolean> => {
    try {
      console.log('🔐 Starting registration process...');
      
      const registerData: RegisterRequest = {
        email,
        password,
        name,
        surname
      };

      console.log('🔄 Starting registration process...');
      const result = await authService.register(registerData);
      console.log('✅ Registration API successful:', result);
      
      // Crea user dai dati di registrazione
      const userData = createMockUser(email, name, surname);
      console.log('✅ Created user for registration:', userData);
      
      // After successful registration, automatically log the user in
      console.log('🔄 Auto-login after registration...');
      const loginResult = await login(email, password); // Usa la password originale per il login
      
      if (loginResult.success) {
        console.log('✅ Auto-login successful');
        toast.success('Registrazione e accesso completati con successo!');
        return true;
      } else {
        console.log('⚠️ Auto-login failed, but registration successful');
        // Anche se il login automatico fallisce, impostiamo manualmente l'utente
        setUser(userData);
        setIsAuthenticated(true);
        toast.success('Registrazione completata con successo!');
        return true;
      }

    } catch (error) {
      console.error('❌ Registration error:', error);
      const apiError = handleAPIError(error);
      toast.error(apiError.message || 'Errore durante la registrazione');
      return false;
    }
  };

  // Logout function
  const logout = async () => {
    try {
      await authService.logout();
    } catch (error) {
      console.error('Logout error:', error);
      // Continue with logout even if API call fails
    } finally {
      // Clear local state
      setUser(null);
      setIsAuthenticated(false);
      tokenUtils.clearAuthTokens();
      toast.success('Logged out successfully');
    }
  };

  // Logout from all devices function
  const logoutFromAllDevices = async () => {
    if (!user?.id) return;
    
    try {
      // Import the security service here to avoid circular imports
      const { securityService } = await import('../services/securityService');
      await securityService.terminateAllSessions(user.id);
      
      // Clear local state (same as regular logout)
      setUser(null);
      setIsAuthenticated(false);
      tokenUtils.clearAuthTokens();
      toast.success('Disconnesso da tutti i dispositivi');
    } catch (error) {
      console.error('Logout from all devices error:', error);
      const apiError = handleAPIError(error);
      toast.error(apiError.message || 'Errore durante la disconnessione');
    }
  };

  // Refresh token function
  const refreshToken = async (): Promise<boolean> => {
    try {
      await authService.refreshToken();
      return true;
    } catch (error) {
      console.error('Token refresh failed:', error);
      // If refresh fails, logout user
      setUser(null);
      setIsAuthenticated(false);
      tokenUtils.clearAuthTokens();
      return false;
    }
  };

  // Set up automatic token refresh
  useEffect(() => {
    if (!isAuthenticated) return;

    const interval = setInterval(() => {
      refreshToken();
    }, 14 * 60 * 1000); // Refresh every 14 minutes (before 15-minute expiry)

    return () => clearInterval(interval);
  }, [isAuthenticated]);

  // Change password function
  const changePassword = async (
    currentPassword: string, 
    newPassword: string, 
    twoFactorCode?: string, 
    twoFactorMethod?: string
  ) => {
    try {
      console.log('🔐 Starting password change...');
      
      const changeRequest = {
        current_password: currentPassword,
        new_password: newPassword,
        ...(twoFactorCode && twoFactorMethod && {
          two_factor_code: twoFactorCode,
          two_factor_method: twoFactorMethod as TwoFactorMethod
        })
      };

      console.log('📡 Sending password change request...');
      await authService.changePassword(changeRequest);
      
      toast.success('Password cambiata con successo');
      return { success: true };
    } catch (error) {
      const apiError = handleAPIError(error);
      return {
        success: false,
        error: apiError.message || 'Errore nel cambio password'
      };
    }
  };

  const value: AuthContextType = {
    user,
    isAuthenticated,
    isLoading,
    login,
    register,
    logout,
    logoutFromAllDevices,
    refreshToken,
    changePassword
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
