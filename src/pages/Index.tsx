
import React, { useState } from 'react';
import { AuthProvider, useAuth } from '@/contexts/AuthContext';
import LoginForm from '@/components/LoginForm';
import RegisterForm from '@/components/RegisterForm';
import SecurityHeader from '@/components/SecurityHeader';
import Dashboard from '@/components/Dashboard';

const AuthenticatedApp: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const [isLoginMode, setIsLoginMode] = useState(true);

  if (isAuthenticated) {
    return (
      <div className="min-h-screen bg-background">
        <SecurityHeader />
        <Dashboard />
      </div>
    );
  }

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
