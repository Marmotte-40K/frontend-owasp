
import React, { useState } from 'react';
import { Shield, Smartphone, Mail, Key, QrCode, Copy, Check } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

const SecuritySettings: React.FC = () => {
  const { user, enable2FA, verify2FA, updateProfile } = useAuth();
  const [twoFactorCode, setTwoFactorCode] = useState('');
  const [qrCodeUrl, setQrCodeUrl] = useState('');
  const [isEnabling2FA, setIsEnabling2FA] = useState(false);
  const [secretCopied, setSecretCopied] = useState(false);
  const [notificationSettings, setNotificationSettings] = useState({
    loginNotifications: true,
    securityAlerts: true,
    dataChanges: true
  });

  const handleEnable2FA = async () => {
    setIsEnabling2FA(true);
    try {
      const qrUrl = await enable2FA();
      setQrCodeUrl(qrUrl);
      toast.success('2FA configurato! Verifica con la tua app.');
    } catch (error) {
      toast.error('Errore nella configurazione 2FA');
    } finally {
      setIsEnabling2FA(false);
    }
  };

  const handleVerify2FA = () => {
    const isValid = verify2FA(twoFactorCode);
    if (isValid) {
      updateProfile({ twoFactorEnabled: true });
      toast.success('2FA attivato con successo!');
      setQrCodeUrl('');
      setTwoFactorCode('');
    } else {
      toast.error('Codice 2FA non valido');
    }
  };

  const copySecret = () => {
    const secret = 'JBSWY3DPEHPK3PXP'; // Mock secret
    navigator.clipboard.writeText(secret);
    setSecretCopied(true);
    toast.success('Segreto copiato negli appunti');
    setTimeout(() => setSecretCopied(false), 2000);
  };

  const handleNotificationChange = (key: string, value: boolean) => {
    setNotificationSettings(prev => ({ ...prev, [key]: value }));
    console.log(`🔔 Notification setting changed: ${key} = ${value}`);
    toast.success('Impostazioni aggiornate');
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Shield className="h-5 w-5" />
            <span>Autenticazione a Due Fattori (2FA)</span>
          </CardTitle>
          <CardDescription>
            Aggiungi un livello extra di sicurezza al tuo account
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Stato 2FA</p>
              <p className="text-sm text-muted-foreground">
                {user?.twoFactorEnabled ? 'Attivato e funzionante' : 'Non configurato'}
              </p>
            </div>
            <Badge variant={user?.twoFactorEnabled ? "default" : "destructive"}>
              {user?.twoFactorEnabled ? 'Attivo' : 'Inattivo'}
            </Badge>
          </div>

          {!user?.twoFactorEnabled && (
            <div className="space-y-4">
              <Separator />
              
              {!qrCodeUrl ? (
                <div className="space-y-4">
                  <div className="flex items-start space-x-3 p-4 bg-muted rounded-lg">
                    <Smartphone className="h-5 w-5 mt-0.5 text-primary" />
                    <div>
                      <p className="font-medium">App Authenticator</p>
                      <p className="text-sm text-muted-foreground">
                        Usa Google Authenticator, Authy o simili per generare codici
                      </p>
                    </div>
                  </div>
                  
                  <Button onClick={handleEnable2FA} disabled={isEnabling2FA}>
                    {isEnabling2FA ? 'Configurazione...' : 'Configura 2FA'}
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="p-4 bg-muted rounded-lg">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-medium">Configurazione 2FA</h4>
                      <QrCode className="h-5 w-5 text-primary" />
                    </div>
                    
                    <div className="space-y-3">
                      <p className="text-sm text-muted-foreground">
                        1. Scansiona questo QR code con la tua app authenticator
                      </p>
                      
                      <div className="bg-white p-4 rounded border w-fit mx-auto">
                        <div className="text-xs text-center font-mono">
                          [QR CODE]<br />
                          Stefan Musitelli<br />
                          {user?.email}
                        </div>
                      </div>
                      
                      <p className="text-sm text-muted-foreground">
                        2. Oppure inserisci manualmente questo segreto:
                      </p>
                      
                      <div className="flex items-center space-x-2">
                        <code className="bg-secondary px-2 py-1 text-xs rounded flex-1">
                          JBSWY3DPEHPK3PXP
                        </code>
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={copySecret}
                        >
                          {secretCopied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                        </Button>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="2fa-code">3. Inserisci il codice generato</Label>
                    <div className="flex space-x-2">
                      <Input
                        id="2fa-code"
                        placeholder="123456"
                        value={twoFactorCode}
                        onChange={(e) => setTwoFactorCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                        className="text-center tracking-widest"
                        maxLength={6}
                      />
                      <Button 
                        onClick={handleVerify2FA}
                        disabled={twoFactorCode.length !== 6}
                      >
                        Verifica
                      </Button>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Per il test, usa il codice: 123456
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Mail className="h-5 w-5" />
            <span>Notifiche di Sicurezza</span>
          </CardTitle>
          <CardDescription>
            Configura quando ricevere avvisi di sicurezza
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Notifiche di login</p>
              <p className="text-sm text-muted-foreground">
                Ricevi email per ogni accesso al tuo account
              </p>
            </div>
            <Switch
              checked={notificationSettings.loginNotifications}
              onCheckedChange={(checked) => handleNotificationChange('loginNotifications', checked)}
            />
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Avvisi di sicurezza</p>
              <p className="text-sm text-muted-foreground">
                Notifiche per attività sospette
              </p>
            </div>
            <Switch
              checked={notificationSettings.securityAlerts}
              onCheckedChange={(checked) => handleNotificationChange('securityAlerts', checked)}
            />
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Modifiche ai dati</p>
              <p className="text-sm text-muted-foreground">
                Avvisi quando i dati sensibili vengono modificati
              </p>
            </div>
            <Switch
              checked={notificationSettings.dataChanges}
              onCheckedChange={(checked) => handleNotificationChange('dataChanges', checked)}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Key className="h-5 w-5" />
            <span>Gestione Password</span>
          </CardTitle>
          <CardDescription>
            Controlli per la sicurezza della password
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
            <div>
              <p className="font-medium">Ultima modifica</p>
              <p className="text-sm text-muted-foreground">
                Mai modificata
              </p>
            </div>
            <Button variant="outline" size="sm">
              Cambia Password
            </Button>
          </div>
          
          <div className="text-sm text-muted-foreground space-y-1">
            <p>• Password hashata con bcrypt (salt rounds: 12)</p>
            <p>• Controllo forza password attivo</p>
            <p>• Rate limiting sui tentativi di login</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SecuritySettings;
