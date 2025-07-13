
import React, { useState } from 'react';
import { AuthProvider } from '@/contexts/AuthContext.tsx';
import { useAuth } from '@/hooks/useAuth';
import LoginForm from '@/components/LoginForm';
import RegisterForm from '@/components/RegisterForm';
import SecurityHeader from '@/components/SecurityHeader';
import Dashboard from '@/components/Dashboard';

const AuthenticatedApp: React.FC = () => {
  const { isAuthenticated, isLoading, user } = useAuth();
  const [isLoginMode, setIsLoginMode] = useState(true);

  // Debug logging
  console.log('🔍 AuthenticatedApp state:', {
    isAuthenticated,
    isLoading,
    user,
    isLoginMode
  });

  if (isLoading) {
    console.log('⏳ Showing loading state...');
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Verifying authentication...</p>
        </div>
      </div>
    );
  }

  if (isAuthenticated) {
    console.log('✅ User is authenticated, showing dashboard...');
    return (
      <div className="min-h-screen bg-background">
        <SecurityHeader />
        <Dashboard />
      </div>
    );
  }

  console.log('🔐 User not authenticated, showing auth forms...');
  return (
    <>
      {isLoginMode ? (
        <LoginForm onToggleMode={() => setIsLoginMode(false)} />
      ) : (
        <RegisterForm onToggleMode={() => setIsLoginMode(true)} />
      )}
    </>
  );
};

const Index: React.FC = () => {
  return (
    <AuthProvider>
      <AuthenticatedApp />
    </AuthProvider>
  );
};

export default Index;
