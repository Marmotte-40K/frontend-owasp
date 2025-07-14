
import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Eye, EyeOff, Shield, Database, Lock, Save, X } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { useAuth } from '@/hooks/useAuth';
import { authService, SensitiveDataRequest, SensitiveDataResponse } from '../services/authService';
import { handleAPIError } from '../lib/apiConstants';

interface SensitiveDataItem {
  type: 'iban' | 'fiscal_code';
  value: string;
  isVisible: boolean;
}

const SensitiveDataManager: React.FC = () => {
  const { user } = useAuth();
  const [sensitiveData, setSensitiveData] = useState<SensitiveDataItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({
    iban: '',
    fiscal_code: ''
  });
  const [tempEditData, setTempEditData] = useState({
    iban: '',
    fiscal_code: ''
  });

  // Load sensitive data on component mount
  useEffect(() => {
    if (user?.id) {
      loadSensitiveData();
    }
  }, [user?.id]);

  const loadSensitiveData = async () => {
    if (!user?.id) return;

    try {
      setIsLoading(true);
      const response = await authService.getSensitiveData(user.id);

      // Convert response to display format
      const dataItems: SensitiveDataItem[] = [];

      if (response.iban) {
        dataItems.push({
          type: 'iban',
          value: response.iban,
          isVisible: false
        });
      }

      if (response.fiscal_code) {
        dataItems.push({
          type: 'fiscal_code',
          value: response.fiscal_code,
          isVisible: false
        });
      }

      setSensitiveData(dataItems);
      setEditData({
        iban: response.iban || '',
        fiscal_code: response.fiscal_code || ''
      });

      console.log('✅ Loaded sensitive data:', response);
    } catch (error) {
      console.error('❌ Error loading sensitive data:', error);
      const apiError = handleAPIError(error);
      toast.error(`Errore nel caricamento dei dati: ${apiError.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const saveSensitiveData = async () => {
    if (!user?.id) return;

    try {
      setIsLoading(true);

      // Prepare data for API
      const dataToSave: SensitiveDataRequest = {};

      if (tempEditData.iban.trim()) {
        dataToSave.iban = tempEditData.iban.trim();
      }

      if (tempEditData.fiscal_code.trim()) {
        dataToSave.fiscal_code = tempEditData.fiscal_code.trim();
      }

      // Check if we have existing data to determine whether to POST or PUT
      const hasExistingData = sensitiveData.length > 0;

      if (hasExistingData) {
        await authService.updateSensitiveData(user.id, dataToSave);
        toast.success('Dati sensibili aggiornati con successo');
      } else {
        await authService.saveSensitiveData(user.id, dataToSave);
        toast.success('Dati sensibili salvati con successo');
      }

      // Update local state
      setEditData(tempEditData);
      setIsEditing(false);

      // Reload data to ensure consistency
      await loadSensitiveData();

    } catch (error) {
      console.error('❌ Error saving sensitive data:', error);
      const apiError = handleAPIError(error);
      toast.error(`Errore nel salvataggio: ${apiError.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const startEditing = () => {
    setTempEditData({ ...editData });
    setIsEditing(true);
  };

  const cancelEditing = () => {
    setTempEditData({ ...editData });
    setIsEditing(false);
  };

  const toggleDataVisibility = (type: 'iban' | 'fiscal_code') => {
    setSensitiveData(prev =>
      prev.map(item =>
        item.type === type
          ? { ...item, isVisible: !item.isVisible }
          : item
      )
    );
  };

  const maskSensitiveValue = (value: string, type: 'iban' | 'fiscal_code'): string => {
    if (type === 'iban') {
      if (value.length <= 8) return value;
      return value.substring(0, 8) + ' **** **** **** ' + value.slice(-4);
    }
    if (type === 'fiscal_code') {
      if (value.length <= 6) return value;
      return value.substring(0, 3) + '***' + value.slice(-3);
    }
    return '*'.repeat(Math.min(value.length, 16));
  };

  if (isLoading && !isEditing) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Database className="h-5 w-5" />
            <span>Gestione Dati Sensibili</span>
          </CardTitle>
          <CardDescription>
            Gestisci in modo sicuro i tuoi dati sensibili
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            <span className="ml-2 text-muted-foreground">Caricamento dati...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center space-x-2">
              <Database className="h-5 w-5" />
              <span>Gestione Dati Sensibili</span>
            </CardTitle>
            <CardDescription>
              Gestisci in modo sicuro i tuoi dati sensibili
            </CardDescription>
          </div>
          <div className="flex items-center space-x-2">
            {!isEditing ? (
              <Button onClick={startEditing} variant="outline" size="sm">
                <Edit className="h-4 w-4 mr-2" />
                Modifica
              </Button>
            ) : (
              <div className="flex space-x-2">
                <Button
                  onClick={saveSensitiveData}
                  size="sm"
                  disabled={isLoading}
                >
                  <Save className="h-4 w-4 mr-2" />
                  {isLoading ? 'Salvataggio...' : 'Salva'}
                </Button>
                <Button
                  onClick={cancelEditing}
                  variant="outline"
                  size="sm"
                  disabled={isLoading}
                >
                  <X className="h-4 w-4 mr-2" />
                  Annulla
                </Button>
              </div>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Security notice */}
        <div className="flex items-start space-x-3 p-4 bg-blue-50 dark:bg-blue-950 rounded-lg border border-blue-200 dark:border-blue-800">
          <Shield className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5" />
          <div className="text-sm">
            <p className="font-medium text-blue-800 dark:text-blue-200">
              Sicurezza garantita
            </p>
            <p className="text-blue-700 dark:text-blue-300">
              I tuoi dati sensibili sono crittografati e protetti con i più alti standard di sicurezza.
            </p>
          </div>
        </div>

        {/* IBAN Section */}
        <div className="space-y-2">
          <Label htmlFor="iban" className="flex items-center space-x-2">
            <span className="text-lg">💳</span>
            <span>IBAN</span>
            <Badge variant="secondary" className="text-xs">
              Coordinate bancarie
            </Badge>
          </Label>
          {isEditing ? (
            <Input
              id="iban"
              value={tempEditData.iban}
              onChange={(e) => setTempEditData(prev => ({ ...prev, iban: e.target.value }))}
              placeholder="IT60 X054 2811 1010 0000 0123 456"
              className="font-mono"
            />
          ) : (
            <div className="flex items-center space-x-2">
              <div className="flex-1 p-3 border rounded-md bg-muted/50 font-mono text-sm">
                {editData.iban ? (
                  <>
                    {sensitiveData.find(item => item.type === 'iban')?.isVisible
                      ? editData.iban
                      : maskSensitiveValue(editData.iban, 'iban')
                    }
                  </>
                ) : (
                  <span className="text-muted-foreground italic">Non configurato</span>
                )}
              </div>
              {editData.iban && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => toggleDataVisibility('iban')}
                  className="p-2"
                >
                  {sensitiveData.find(item => item.type === 'iban')?.isVisible ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </Button>
              )}
            </div>
          )}
        </div>

        {/* Fiscal Code Section */}
        <div className="space-y-2">
          <Label htmlFor="fiscal_code" className="flex items-center space-x-2">
            <span className="text-lg">🆔</span>
            <span>Codice Fiscale</span>
            <Badge variant="secondary" className="text-xs">
              Identificativo fiscale
            </Badge>
          </Label>
          {isEditing ? (
            <Input
              id="fiscal_code"
              value={tempEditData.fiscal_code}
              onChange={(e) => setTempEditData(prev => ({ ...prev, fiscal_code: e.target.value.toUpperCase() }))}
              placeholder="RSSMRA80A01H501U"
              className="font-mono uppercase"
              maxLength={16}
            />
          ) : (
            <div className="flex items-center space-x-2">
              <div className="flex-1 p-3 border rounded-md bg-muted/50 font-mono text-sm">
                {editData.fiscal_code ? (
                  <>
                    {sensitiveData.find(item => item.type === 'fiscal_code')?.isVisible
                      ? editData.fiscal_code
                      : maskSensitiveValue(editData.fiscal_code, 'fiscal_code')
                    }
                  </>
                ) : (
                  <span className="text-muted-foreground italic">Non configurato</span>
                )}
              </div>
              {editData.fiscal_code && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => toggleDataVisibility('fiscal_code')}
                  className="p-2"
                >
                  {sensitiveData.find(item => item.type === 'fiscal_code')?.isVisible ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </Button>
              )}
            </div>
          )}
        </div>

        {/* Help text for editing */}
        {isEditing && (
          <div className="text-xs text-muted-foreground mt-4 p-3 bg-muted/30 rounded-md">
            <p className="font-medium mb-1">💡 Suggerimenti:</p>
            <ul className="space-y-1 ml-4">
              <li>• L'IBAN deve essere nel formato standard (es: IT60 X054 2811 1010 0000 0123 456)</li>
              <li>• Il Codice Fiscale deve essere di 16 caratteri alfanumerici</li>
              <li>• Lascia vuoto un campo per rimuoverlo</li>
            </ul>
          </div>
        )}

        {/* Empty state when no data */}
        {!isEditing && !editData.iban && !editData.fiscal_code && (
          <div className="text-center py-8">
            <Database className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium text-muted-foreground mb-2">
              Nessun dato sensibile configurato
            </h3>
            <p className="text-sm text-muted-foreground mb-4">
              Aggiungi i tuoi dati sensibili per gestirli in modo sicuro
            </p>
            <Button onClick={startEditing} variant="outline">
              <Plus className="h-4 w-4 mr-2" />
              Aggiungi dati
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default SensitiveDataManager;
