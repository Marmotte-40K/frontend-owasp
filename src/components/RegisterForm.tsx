
import React, { useState } from 'react';
import { Eye, EyeOff, Shield, Lock, Mail, User, Check, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

interface RegisterFormProps {
  onToggleMode: () => void;
}

const RegisterForm: React.FC<RegisterFormProps> = ({ onToggleMode }) => {
  const [formData, setFormData] = useState({
    name: '',
    surname: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  const { register } = useAuth();

  // Password strength validation
  const getPasswordStrength = (password: string) => {
    if (!password) return { score: 0, level: 'Molto debole', checks: {} };
    
    const checks = {
      length: password.length >= 8,
      lowercase: /[a-z]/.test(password),
      uppercase: /[A-Z]/.test(password),
      numbers: /\d/.test(password),
      special: /[!@#$%^&*(),.?":{}|<>]/.test(password)
    };
    
    const score = Object.values(checks).filter(Boolean).length;
    const level = score < 2 ? 'Molto debole' : score < 3 ? 'Debole' : score < 4 ? 'Media' : score < 5 ? 'Forte' : 'Molto forte';
    
    return { score, level, checks };
  };
  
  const passwordStrength = getPasswordStrength(formData.password);
  const isPasswordValid = passwordStrength.score >= 3;

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.surname || !formData.email || !formData.password) {
      toast.error('Compila tutti i campi obbligatori');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      toast.error('Le password non coincidono');
      return;
    }

    if (!isPasswordValid) {
      toast.error('La password deve essere più sicura');
      return;
    }

    setIsLoading(true);

    try {
      console.log('🔄 Submitting registration form...');
      const success = await register(formData.email, formData.password, formData.name, formData.surname);
      
      if (success) {
        console.log('✅ Registration flow completed successfully');
        // Reset form
        setFormData({
          name: '',
          surname: '',
          email: '',
          password: '',
          confirmPassword: ''
        });
        // Note: User should now be authenticated and redirected to dashboard automatically
      } else {
        console.log('❌ Registration flow failed');
      }
    } catch (error) {
      console.error('❌ Registration error in component:', error);
      toast.error('Errore durante la registrazione');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-secondary/20 p-4">
      <Card className="w-full max-w-md animate-slide-in">
        <CardHeader className="space-y-1 text-center">
          <div className="flex justify-center mb-4">
            <div className="p-3 bg-primary/10 rounded-full">
              <Shield className="h-8 w-8 text-primary" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold">Registrazione Sicura</CardTitle>
          <CardDescription>
            Crea un nuovo account protetto
          </CardDescription>
        </CardHeader>
        
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nome</Label>
              <div className="relative">
                <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="name"
                  type="text"
                  placeholder="Mario"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  className="pl-10"
                  disabled={isLoading}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="surname">Cognome</Label>
              <div className="relative">
                <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="surname"
                  type="text"
                  placeholder="Rossi"
                  value={formData.surname}
                  onChange={(e) => handleInputChange('surname', e.target.value)}
                  className="pl-10"
                  disabled={isLoading}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="nome@esempio.com"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  className="pl-10"
                  disabled={isLoading}
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
                  value={formData.password}
                  onChange={(e) => handleInputChange('password', e.target.value)}
                  className="pl-10 pr-10"
                  disabled={isLoading}
                  required
                />
                <button
                  type="button"
                  className="absolute right-3 top-3 text-muted-foreground hover:text-foreground"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={isLoading}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              
              {formData.password && (
                <div className="space-y-2 animate-slide-in">
                  <div className="flex items-center justify-between text-xs">
                    <span>Sicurezza password: {passwordStrength.level}</span>
                    <span>{passwordStrength.score}/5</span>
                  </div>
                  <Progress value={(passwordStrength.score / 5) * 100} className="h-2" />
                  
                  <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground">
                    {Object.entries(passwordStrength.checks).map(([key, valid]) => (
                      <div key={key} className="flex items-center space-x-1">
                        {valid ? (
                          <Check className="h-3 w-3 text-success" />
                        ) : (
                          <X className="h-3 w-3 text-destructive" />
                        )}
                        <span className={valid ? 'text-success' : 'text-destructive'}>
                          {key === 'length' && 'Min 8 caratteri'}
                          {key === 'lowercase' && 'Minuscola'}
                          {key === 'uppercase' && 'Maiuscola'}
                          {key === 'numbers' && 'Numero'}
                          {key === 'special' && 'Simbolo'}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Conferma Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={formData.confirmPassword}
                  onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                  className="pl-10 pr-10"
                  disabled={isLoading}
                  required
                />
                <button
                  type="button"
                  className="absolute right-3 top-3 text-muted-foreground hover:text-foreground"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  disabled={isLoading}
                >
                  {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {formData.confirmPassword && formData.password !== formData.confirmPassword && (
                <p className="text-xs text-destructive flex items-center space-x-1">
                  <X className="h-3 w-3" />
                  <span>Le password non coincidono</span>
                </p>
              )}
            </div>
          </CardContent>

          <CardFooter className="flex flex-col space-y-4">
            <Button 
              type="submit" 
              className="w-full"
              disabled={isLoading || passwordStrength.score < 3}
            >
              {isLoading ? 'Registrazione in corso...' : 'Registrati'}
            </Button>
            
            <button
              type="button"
              onClick={onToggleMode}
              className="text-sm text-primary hover:underline"
            >
              Hai già un account? Accedi
            </button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
};

export default RegisterForm;
