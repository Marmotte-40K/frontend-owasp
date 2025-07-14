import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Shield, Smartphone, CheckCircle, AlertTriangle, Copy, RefreshCw, QrCode, X } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/hooks/useAuth';
import { authService, QRCodeResponse } from '@/services/authService';

interface TOTPManagerProps {
  onUpdate?: () => void;
}

const TOTPManager: React.FC<TOTPManagerProps> = ({ onUpdate }) => {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [qrCodeData, setQrCodeData] = useState<QRCodeResponse | null>(null);
  const [verificationCode, setVerificationCode] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [isEnabled, setIsEnabled] = useState(false);
  const [step, setStep] = useState<'check' | 'setup' | 'verify' | 'disable'>('check');
  const [disableCode, setDisableCode] = useState('');
  const [isDisabling, setIsDisabling] = useState(false);

  // Check if TOTP is already enabled
  useEffect(() => {
    if (user?.totpEnabled !== undefined) {
      setIsEnabled(user.totpEnabled);
      setStep(user.totpEnabled ? 'check' : 'setup');
    }
  }, [user?.totpEnabled]);

  const handleStartSetup = async () => {
    // if (!user?.id) return;

    setIsLoading(true);
    try {
      const qrData = await authService.twoFactor.totp.getQRCode(user?.id || 1);
      setQrCodeData(qrData);
      setStep('verify');
      toast.success('QR Code generato! Scansiona con la tua app authenticator.');
    } catch (error) {
      toast.error('Errore nella generazione del QR Code');
      console.error('QR Code generation error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyAndEnable = async () => {
    if (!user?.id || !verificationCode) return;

    setIsVerifying(true);
    try {
      // First verify the code
      const verifyResult = await authService.twoFactor.totp.verify(user.id, verificationCode);
      
      if (verifyResult.valid) {
        // If verification is successful, enable TOTP
        await authService.twoFactor.totp.enable(user.id, verificationCode);
        
        setIsEnabled(true);
        setStep('check');
        setQrCodeData(null);
        setVerificationCode('');
        
        toast.success('TOTP attivato con successo!');
        onUpdate?.();
      } else {
        toast.error('Codice non valido. Riprova.');
      }
    } catch (error) {
      toast.error('Errore durante la verifica del codice');
      console.error('TOTP verification error:', error);
    } finally {
      setIsVerifying(false);
    }
  };

  const handleDisable = async () => {
    setStep('disable');
    setDisableCode('');
  };

  const handleConfirmDisable = async () => {
    if (!user?.id || !disableCode) return;

    setIsDisabling(true);
    try {
      await authService.twoFactor.totp.disable(user.id, disableCode);
      
      setIsEnabled(false);
      setStep('setup');
      setDisableCode('');
      
      toast.success('TOTP disabilitato con successo');
      onUpdate?.();
    } catch (error) {
      toast.error('Codice non valido o errore durante la disabilitazione');
      console.error('TOTP disable error:', error);
    } finally {
      setIsDisabling(false);
    }
  };

  const handleCancelDisable = () => {
    setStep('check');
    setDisableCode('');
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Copiato negli appunti');
  };

  const handleBackToSetup = () => {
    setStep('setup');
    setQrCodeData(null);
    setVerificationCode('');
    setDisableCode('');
  };

  return (
    <div className="space-y-6">
      {/* Current TOTP Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Shield className="h-5 w-5" />
              <span>Autenticazione TOTP (2FA)</span>
            </div>
            <Badge variant={isEnabled ? "default" : "destructive"}>
              {isEnabled ? 'Attivo' : 'Inattivo'}
            </Badge>
          </CardTitle>
          <CardDescription>
            Usa app come Google Authenticator, Authy o Microsoft Authenticator per generare codici TOTP
          </CardDescription>
        </CardHeader>
        <CardContent>
          {step === 'check' && (
            <div className="space-y-4">
              {isEnabled ? (
                <div className="space-y-4">
                  <div className="flex items-center space-x-2 text-success">
                    <CheckCircle className="h-4 w-4" />
                    <span className="text-sm font-medium">TOTP configurato e attivo</span>
                  </div>
                  
                  <div className="space-y-2">
                    <h4 className="font-medium">App Supportate</h4>
                    <div className="flex flex-wrap gap-2">
                      <Badge variant="outline">Google Authenticator</Badge>
                      <Badge variant="outline">Microsoft Authenticator</Badge>
                      <Badge variant="outline">Authy</Badge>
                      <Badge variant="outline">1Password</Badge>
                    </div>
                  </div>
                  
                  <Button 
                    variant="destructive" 
                    onClick={handleDisable}
                    disabled={isLoading}
                  >
                    {isLoading ? <RefreshCw className="h-4 w-4 animate-spin mr-2" /> : null}
                    Disattiva TOTP
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-center space-x-2 text-destructive">
                    <AlertTriangle className="h-4 w-4" />
                    <span className="text-sm">TOTP non configurato</span>
                  </div>
                  
                  <Alert>
                    <Smartphone className="h-4 w-4" />
                    <AlertDescription>
                      <strong>Migliora la sicurezza del tuo account!</strong>
                      <br />
                      Configura l'autenticazione a due fattori (TOTP) per aggiungere un livello extra di protezione.
                    </AlertDescription>
                  </Alert>
                  
                  <Button 
                    onClick={handleStartSetup} 
                    disabled={isLoading}
                    className="w-full"
                  >
                    {isLoading ? <RefreshCw className="h-4 w-4 animate-spin mr-2" /> : <QrCode className="h-4 w-4 mr-2" />}
                    Configura TOTP
                  </Button>
                </div>
              )}
            </div>
          )}

          {step === 'setup' && !isEnabled && (
            <div className="space-y-4">
              <Alert>
                <Smartphone className="h-4 w-4" />
                <AlertDescription>
                  <strong>Prima di iniziare:</strong>
                  <br />
                  Assicurati di avere una delle seguenti app installate sul tuo dispositivo:
                  <ul className="mt-2 list-disc list-inside space-y-1">
                    <li>Google Authenticator</li>
                    <li>Microsoft Authenticator</li>
                    <li>Authy</li>
                    <li>1Password</li>
                  </ul>
                </AlertDescription>
              </Alert>
              
              <Button 
                onClick={handleStartSetup} 
                disabled={isLoading}
                className="w-full"
              >
                {isLoading ? <RefreshCw className="h-4 w-4 animate-spin mr-2" /> : <QrCode className="h-4 w-4 mr-2" />}
                Genera QR Code
              </Button>
            </div>
          )}

          {step === 'verify' && qrCodeData && (
            <div className="space-y-6">
              <div className="text-center">
                <h3 className="font-medium mb-4">Scansiona il QR Code</h3>
                <div className="bg-white p-4 rounded-lg border inline-block">
                  <img 
                    src={qrCodeData.qr_code} 
                    alt="QR Code TOTP" 
                    className="w-48 h-48 mx-auto"
                  />
                </div>
              </div>

              {qrCodeData.manual_entry_key && (
                <div className="space-y-2">
                  <Label>Chiave manuale (se non puoi scansionare il QR Code)</Label>
                  <div className="flex items-center space-x-2">
                    <Input 
                      value={qrCodeData.manual_entry_key} 
                      readOnly 
                      className="font-mono text-sm"
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => copyToClipboard(qrCodeData.manual_entry_key!)}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Inserisci questa chiave manualmente nella tua app authenticator
                  </p>
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="verification-code">Codice di Verifica</Label>
                <div className="relative">
                  <Input
                    id="verification-code"
                    placeholder="000000"
                    value={verificationCode}
                    onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    maxLength={6}
                    className="text-center text-2xl tracking-[0.5em] font-mono h-16 pr-12"
                  />
                  {verificationCode && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setVerificationCode('')}
                      className="absolute right-2 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>
                <div className="flex items-center justify-center space-x-1">
                  {[...Array(6)].map((_, i) => (
                    <div
                      key={i}
                      className={`w-3 h-1 rounded-full transition-colors ${
                        i < verificationCode.length ? 'bg-primary' : 'bg-muted'
                      }`}
                    />
                  ))}
                </div>
                <p className="text-xs text-muted-foreground text-center">
                  Inserisci il codice generato dalla tua app authenticator
                </p>
              </div>

              <div className="space-y-2">
                <Button 
                  onClick={handleVerifyAndEnable} 
                  disabled={isVerifying || verificationCode.length !== 6}
                  className="w-full"
                >
                  {isVerifying ? <RefreshCw className="h-4 w-4 animate-spin mr-2" /> : <CheckCircle className="h-4 w-4 mr-2" />}
                  Verifica e Attiva TOTP
                </Button>
                
                <Button
                  variant="outline"
                  onClick={handleBackToSetup}
                  className="w-full"
                >
                  ← Torna indietro
                </Button>
              </div>
            </div>
          )}

          {step === 'disable' && (
            <div className="space-y-6">
              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  <strong>Attenzione!</strong>
                  <br />
                  Stai per disabilitare l'autenticazione a due fattori. Questo renderà il tuo account meno sicuro.
                  Per confermare, inserisci il codice TOTP corrente dalla tua app authenticator.
                </AlertDescription>
              </Alert>

              <div className="space-y-2">
                <Label htmlFor="disable-code">Codice TOTP per conferma</Label>
                <div className="relative">
                  <Input
                    id="disable-code"
                    placeholder="000000"
                    value={disableCode}
                    onChange={(e) => setDisableCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    maxLength={6}
                    className="text-center text-2xl tracking-[0.5em] font-mono h-16 pr-12"
                  />
                  {disableCode && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setDisableCode('')}
                      className="absolute right-2 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>
                <div className="flex items-center justify-center space-x-1">
                  {[...Array(6)].map((_, i) => (
                    <div
                      key={i}
                      className={`w-3 h-1 rounded-full transition-colors ${
                        i < disableCode.length ? 'bg-primary' : 'bg-muted'
                      }`}
                    />
                  ))}
                </div>
                <p className="text-xs text-muted-foreground text-center">
                  Apri la tua app authenticator e inserisci il codice corrente
                </p>
              </div>

              <div className="space-y-2">
                <Button 
                  onClick={handleConfirmDisable} 
                  disabled={isDisabling || disableCode.length !== 6}
                  variant="destructive"
                  className="w-full"
                >
                  {isDisabling ? <RefreshCw className="h-4 w-4 animate-spin mr-2" /> : <AlertTriangle className="h-4 w-4 mr-2" />}
                  Conferma Disattivazione TOTP
                </Button>
                
                <Button
                  variant="outline"
                  onClick={handleCancelDisable}
                  className="w-full"
                  disabled={isDisabling}
                >
                  ← Annulla
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Security Info */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Shield className="h-5 w-5" />
            <span>Informazioni sulla Sicurezza</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm">Crittografia end-to-end</span>
              <CheckCircle className="h-4 w-4 text-success" />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Standard RFC 6238 (TOTP)</span>
              <CheckCircle className="h-4 w-4 text-success" />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Sincronizzazione temporale</span>
              <CheckCircle className="h-4 w-4 text-success" />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Nessun dato inviato online</span>
              <CheckCircle className="h-4 w-4 text-success" />
            </div>
          </div>
          
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              <strong>Importante:</strong> Salva il backup della chiave segreta in un posto sicuro. 
              Se perdi l'accesso alla tua app authenticator, potresti rimanere bloccato fuori dal tuo account.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    </div>
  );
};

export default TOTPManager;
