import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Key, Shield, AlertTriangle, RefreshCw, Smartphone } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/hooks/useAuth';

const PasswordChangeForm: React.FC = () => {
  const { user, changePassword } = useAuth();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [totpCode, setTotpCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState<'weak' | 'medium' | 'strong'>('weak');

  // Password strength validation
  useEffect(() => {
    if (newPassword) {
      const strength = calculatePasswordStrength(newPassword);
      setPasswordStrength(strength);
    }
  }, [newPassword]);

  const calculatePasswordStrength = (password: string): 'weak' | 'medium' | 'strong' => {
    let score = 0;
    
    // Length check
    if (password.length >= 8) score++;
    if (password.length >= 12) score++;
    
    // Character variety
    if (/[a-z]/.test(password)) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^a-zA-Z0-9]/.test(password)) score++;
    
    if (score <= 2) return 'weak';
    if (score <= 4) return 'medium';
    return 'strong';
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!currentPassword || !newPassword || !confirmPassword) {
      toast.error('Tutti i campi sono obbligatori');
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error('Le password non coincidono');
      return;
    }

    if (passwordStrength === 'weak') {
      toast.error('La password è troppo debole');
      return;
    }

    // TOTP validation if user has TOTP enabled
    if (user?.totpEnabled && !totpCode) {
      toast.error('Inserisci il codice TOTP per procedere');
      return;
    }

    setIsLoading(true);
    try {
      const result = await changePassword(
        currentPassword,
        newPassword,
        user?.totpEnabled ? totpCode : undefined,
        user?.totpEnabled ? 'totp' : undefined
      );

      if (result.success) {
        toast.success('Password cambiata con successo');
        
        // Reset form
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
        setTotpCode('');
      } else {
        toast.error(result.error || 'Errore nel cambio password');
      }
      
    } catch (error) {
      toast.error('Errore nel cambio password');
      console.error('Password change error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getPasswordStrengthColor = () => {
    switch (passwordStrength) {
      case 'weak':
        return 'text-destructive';
      case 'medium':
        return 'text-yellow-600';
      case 'strong':
        return 'text-success';
      default:
        return 'text-muted-foreground';
    }
  };

  const getPasswordStrengthText = () => {
    switch (passwordStrength) {
      case 'weak':
        return 'Debole';
      case 'medium':
        return 'Media';
      case 'strong':
        return 'Forte';
      default:
        return '';
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Key className="h-5 w-5" />
          <span>Cambia Password</span>
        </CardTitle>
        <CardDescription>
          Aggiorna la tua password per mantenere l'account sicuro
          {user?.totpEnabled && (
            <span className="block mt-1 text-sm">
              ⚠️ La verifica TOTP è richiesta per cambiare la password
            </span>
          )}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handlePasswordChange} className="space-y-6">
          {/* Current Password */}
          <div className="space-y-2">
            <Label htmlFor="current-password">Password Attuale</Label>
            <Input
              id="current-password"
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              placeholder="Inserisci la password attuale"
              required
            />
          </div>

          {/* New Password */}
          <div className="space-y-2">
            <Label htmlFor="new-password">Nuova Password</Label>
            <Input
              id="new-password"
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Inserisci la nuova password"
              required
            />
            {newPassword && (
              <div className={`text-sm ${getPasswordStrengthColor()}`}>
                Sicurezza: {getPasswordStrengthText()}
              </div>
            )}
          </div>

          {/* Confirm Password */}
          <div className="space-y-2">
            <Label htmlFor="confirm-password">Conferma Password</Label>
            <Input
              id="confirm-password"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Conferma la nuova password"
              required
            />
            {confirmPassword && newPassword !== confirmPassword && (
              <div className="text-sm text-destructive">
                Le password non coincidono
              </div>
            )}
          </div>

          {/* Password Requirements */}
          <Alert>
            <Shield className="h-4 w-4" />
            <AlertDescription>
              <strong>Requisiti password:</strong>
              <ul className="mt-2 space-y-1 text-sm">
                <li className={newPassword.length >= 8 ? 'text-success' : 'text-muted-foreground'}>
                  {newPassword.length >= 8 ? '✓' : '○'} Almeno 8 caratteri
                </li>
                <li className={/[A-Z]/.test(newPassword) ? 'text-success' : 'text-muted-foreground'}>
                  {/[A-Z]/.test(newPassword) ? '✓' : '○'} Almeno una lettera maiuscola
                </li>
                <li className={/[a-z]/.test(newPassword) ? 'text-success' : 'text-muted-foreground'}>
                  {/[a-z]/.test(newPassword) ? '✓' : '○'} Almeno una lettera minuscola
                </li>
                <li className={/[0-9]/.test(newPassword) ? 'text-success' : 'text-muted-foreground'}>
                  {/[0-9]/.test(newPassword) ? '✓' : '○'} Almeno un numero
                </li>
                <li className={/[^a-zA-Z0-9]/.test(newPassword) ? 'text-success' : 'text-muted-foreground'}>
                  {/[^a-zA-Z0-9]/.test(newPassword) ? '✓' : '○'} Almeno un carattere speciale
                </li>
              </ul>
            </AlertDescription>
          </Alert>

          {/* TOTP Section */}
          {user?.totpEnabled && (
            <div className="space-y-4 border-t pt-4">
              <div className="flex items-center space-x-2">
                <Smartphone className="h-4 w-4" />
                <span className="font-medium">Verifica TOTP Richiesta</span>
              </div>

              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  Hai il TOTP attivato. Inserisci il codice dalla tua app authenticator per procedere con il cambio password.
                </AlertDescription>
              </Alert>

              {/* TOTP Code Input */}
              <div className="space-y-2">
                <Label htmlFor="totp-code">Codice TOTP</Label>
                <Input
                  id="totp-code"
                  placeholder="Inserisci il codice a 6 cifre dall'app authenticator"
                  value={totpCode}
                  onChange={(e) => setTotpCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  maxLength={6}
                  required
                />
                <p className="text-xs text-muted-foreground">
                  Apri la tua app authenticator (Google Authenticator, Authy, ecc.) e inserisci il codice corrente
                </p>
              </div>
            </div>
          )}

          {/* Submit Button */}
          <Button 
            type="submit" 
            className="w-full" 
            disabled={
              isLoading || 
              !currentPassword || 
              !newPassword || 
              !confirmPassword ||
              newPassword !== confirmPassword ||
              passwordStrength === 'weak' ||
              (user?.totpEnabled && (!totpCode || totpCode.length !== 6))
            }
          >
            {isLoading ? <RefreshCw className="h-4 w-4 animate-spin mr-2" /> : <Key className="h-4 w-4 mr-2" />}
            Cambia Password
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default PasswordChangeForm;
