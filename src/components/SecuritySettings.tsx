import React from 'react';
import { Shield } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import TOTPManager from './TOTPManager';
import PasswordChangeForm from './PasswordChangeForm';

const SecuritySettings: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-2">
        <Shield className="h-6 w-6" />
        <div>
          <h2 className="text-2xl font-bold">Impostazioni di Sicurezza</h2>
          <p className="text-muted-foreground">
            Gestisci la sicurezza del tuo account e la protezione dei dati
          </p>
        </div>
      </div>

      <Tabs defaultValue="2fa" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="2fa">Autenticazione 2FA</TabsTrigger>
          <TabsTrigger value="password">Cambio Password</TabsTrigger>
        </TabsList>

        <TabsContent value="2fa" className="space-y-6">
          <TOTPManager />
        </TabsContent>

        <TabsContent value="password" className="space-y-6">
          <PasswordChangeForm />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SecuritySettings;
