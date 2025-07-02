
import React, { useState } from 'react';
import { Eye, EyeOff, Shield, Lock, Mail, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

interface LoginFormProps {
  onToggleMode: () => void;
}

const LoginForm: React.FC<LoginFormProps> = ({ onToggleMode }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [twoFactorCode, setTwoFactorCode] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [show2FA, setShow2FA] = useState(false);
  const [loginAttempts, setLoginAttempts] = useState(0);
  
  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) {
      toast.error('Compila tutti i campi obbligatori');
      return;
    }

    if (show2FA && !twoFactorCode) {
      toast.error('Inserisci il codice 2FA');
      return;
    }

    setIsLoading(true);

    try {
      // Simulate 2FA requirement for some users
      if (!show2FA && email.includes('2fa')) {
        setShow2FA(true);
        toast.info('Codice 2FA richiesto. Usa 123456 per il test.');
        setIsLoading(false);
        return;
      }

      const success = await login(email, password, twoFactorCode);
      
      if (success) {
        console.log('✅ Login successful');
        setLoginAttempts(0);
      } else {
        setLoginAttempts(prev => prev + 1);
        toast.error('Credenziali non valide');
      }
    } catch (error) {
      console.error('❌ Login error:', error);
      setLoginAttempts(prev => prev + 1);
      toast.error('Errore durante il login');
    } finally {
      setIsLoading(false);
    }
  };

  const maxAttempts = 5;
  const isBlocked = loginAttempts >= maxAttempts;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-secondary/20 p-4">
      <Card className="w-full max-w-md animate-slide-in">
        <CardHeader className="space-y-1 text-center">
          <div className="flex justify-center mb-4">
            <div className="p-3 bg-primary/10 rounded-full">
              <Shield className="h-8 w-8 text-primary" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold">Accesso Sicuro</CardTitle>
          <CardDescription>
            Inserisci le tue credenziali per accedere
          </CardDescription>
        </CardHeader>
        
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            {isBlocked && (
              <Alert className="border-destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  Account temporaneamente bloccato per troppi tentativi falliti.
                </AlertDescription>
              </Alert>
            )}

            {loginAttempts > 0 && !isBlocked && (
              <Alert className="border-warning">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  Tentativo {loginAttempts}/{maxAttempts}. 
                  {maxAttempts - loginAttempts} tentativi rimasti.
                </AlertDescription>
              </Alert>
            )}

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="nome@esempio.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10"
                  disabled={isBlocked || isLoading}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10 pr-10"
                  disabled={isBlocked || isLoading}
                  required
                />
                <button
                  type="button"
                  className="absolute right-3 top-3 text-muted-foreground hover:text-foreground"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={isBlocked || isLoading}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {show2FA && (
              <div className="space-y-2 animate-slide-in">
                <Label htmlFor="twoFactorCode">Codice 2FA</Label>
                <Input
                  id="twoFactorCode"
                  type="text"
                  placeholder="123456"
                  value={twoFactorCode}
                  onChange={(e) => setTwoFactorCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  className="text-center tracking-widest"
                  disabled={isBlocked || isLoading}
                  maxLength={6}
                />
                <p className="text-xs text-muted-foreground text-center">
                  Per il test, usa il codice: 123456
                </p>
              </div>
            )}
          </CardContent>

          <CardFooter className="flex flex-col space-y-4">
            <Button 
              type="submit" 
              className="w-full"
              disabled={isBlocked || isLoading}
            >
              {isLoading ? 'Accesso in corso...' : 'Accedi'}
            </Button>
            
            <div className="text-center space-y-2">
              <button
                type="button"
                onClick={onToggleMode}
                className="text-sm text-primary hover:underline"
              >
                Non hai un account? Registrati
              </button>
              <p className="text-xs text-muted-foreground">
                Usa email@2fa.com per testare il 2FA
              </p>
            </div>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
};

export default LoginForm;
