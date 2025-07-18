
import React, { useState } from 'react';
import { Shield, Key, Database, Activity, Settings, AlertTriangle, CheckCircle, Clock } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/hooks/useAuth';
import SecuritySettings from './SecuritySettings';
import SensitiveDataManager from './SensitiveDataManager';

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');

  // Debug logging
  console.log('🔍 Dashboard user state:', user);

  // Handle case where user is null
  if (!user) {
    console.log('⚠️ Dashboard: User is null, showing fallback');
    return (
      <div className="container mx-auto px-4 py-6">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Caricamento dati utente...</p>
          </div>
        </div>
      </div>
    );
  }

  const securityStats = {
    activeDevices: 1,
    twoFactorEnabled: user.totpEnabled || false,
    dataEncrypted: true,
    lastBackup: '2 giorni fa'
  };

  return (
    <div className="container mx-auto px-4 py-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Dashboard Sicurezza</h1>
          <p className="text-muted-foreground">
            Benvenuto, {user.name} {user.surname}. Gestisci i tuoi dati in sicurezza.
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            📧 {user.email} • 🆔 ID: {user.id} • {user.totpEnabled ? '🔐 TOTP Attivo' : '⚠️ TOTP Inattivo'}
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Badge variant={securityStats.twoFactorEnabled ? "default" : "destructive"}>
            {securityStats.twoFactorEnabled ? 'Sicuro' : 'A rischio'}
          </Badge>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview">Panoramica</TabsTrigger>
          <TabsTrigger value="data">Dati Sensibili</TabsTrigger>
          <TabsTrigger value="security">Sicurezza</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Dispositivi Attivi</CardTitle>
                <Activity className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{securityStats.activeDevices}</div>
                <p className="text-xs text-muted-foreground">
                  Dispositivo corrente
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">2FA Status</CardTitle>
                {securityStats.twoFactorEnabled ? (
                  <CheckCircle className="h-4 w-4 text-success" />
                ) : (
                  <AlertTriangle className="h-4 w-4 text-destructive" />
                )}
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {securityStats.twoFactorEnabled ? 'Attivo' : 'Inattivo'}
                </div>
                <p className="text-xs text-muted-foreground">
                  Autenticazione a due fattori
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Crittografia</CardTitle>
                <Shield className="h-4 w-4 text-success" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">bcrypt</div>
                <p className="text-xs text-muted-foreground">
                  Dati crittografati
                </p>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Shield className="h-5 w-5" />
                  <span>Stato Sicurezza</span>
                </CardTitle>
                <CardDescription>
                  Panoramica delle misure di sicurezza attive
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Password hashata (bcrypt)</span>
                  <CheckCircle className="h-4 w-4 text-success" />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Dati sensibili crittografati</span>
                  <CheckCircle className="h-4 w-4 text-success" />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Token JWT sicuri</span>
                  <CheckCircle className="h-4 w-4 text-success" />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Logging delle attività</span>
                  <CheckCircle className="h-4 w-4 text-success" />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Autenticazione 2FA</span>
                  {securityStats.twoFactorEnabled ? (
                    <CheckCircle className="h-4 w-4 text-success" />
                  ) : (
                    <AlertTriangle className="h-4 w-4 text-destructive" />
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Key className="h-5 w-5" />
                  <span>Gestione Sessioni</span>
                </CardTitle>
                <CardDescription>
                  Controllo dei dispositivi e token di accesso
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                  <div>
                    <p className="text-sm font-medium">Dispositivo corrente</p>
                    <p className="text-xs text-muted-foreground">
                      Token valido per 15 minuti
                    </p>
                  </div>
                  <Badge variant="outline">Attivo</Badge>
                </div>

                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => console.log('Logout from all devices')}
                  className="w-full"
                >
                  Disconnetti da tutti i dispositivi
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="data">
          <SensitiveDataManager />
        </TabsContent>

        <TabsContent value="security">
          <SecuritySettings />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Dashboard;
