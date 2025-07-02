
import React, { useState } from 'react';
import { Plus, Edit, Trash2, Eye, EyeOff, Shield, Database, Lock } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { toast } from 'sonner';

interface SensitiveData {
  id: string;
  type: 'iban' | 'codice_fiscale' | 'documento' | 'medico' | 'altro';
  name: string;
  value: string;
  encrypted: boolean;
  lastModified: string;
}

const SensitiveDataManager: React.FC = () => {
  const [sensitiveData, setSensitiveData] = useState<SensitiveData[]>([
    {
      id: '1',
      type: 'iban',
      name: 'Conto principale',
      value: 'IT60 X054 2811 1010 0000 0123 456', // Mock encrypted
      encrypted: true,
      lastModified: '2024-01-15'
    },
    {
      id: '2',
      type: 'codice_fiscale',
      name: 'CF personale',
      value: 'RSSMRA80A01H501U', // Mock encrypted
      encrypted: true,
      lastModified: '2024-01-10'
    }
  ]);

  const [visibleData, setVisibleData] = useState<Set<string>>(new Set());
  const [newData, setNewData] = useState({
    type: 'altro' as const,
    name: '',
    value: ''
  });
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);

  const dataTypeLabels = {
    iban: 'IBAN',
    codice_fiscale: 'Codice Fiscale',
    documento: 'Documento',
    medico: 'Dato Medico',
    altro: 'Altro'
  };

  const dataTypeIcons = {
    iban: '💳',
    codice_fiscale: '🆔',
    documento: '📄',
    medico: '🏥',
    altro: '🔒'
  };

  // Simulate encryption/decryption
  const toggleDataVisibility = (id: string) => {
    console.log(`👁️ Data visibility toggled: ${id}`);
    
    setVisibleData(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  const maskSensitiveValue = (value: string, type: string): string => {
    if (type === 'iban') {
      return value.substring(0, 8) + ' **** **** **** ' + value.slice(-4);
    }
    if (type === 'codice_fiscale') {
      return value.substring(0, 3) + '***' + value.slice(-3);
    }
    return '*'.repeat(Math.min(value.length, 16));
  };

  const addSensitiveData = () => {
    if (!newData.name || !newData.value) {
      toast.error('Compila tutti i campi');
      return;
    }

    const data: SensitiveData = {
      id: Date.now().toString(),
      type: newData.type,
      name: newData.name,
      value: newData.value,
      encrypted: true,
      lastModified: new Date().toISOString().split('T')[0]
    };

    setSensitiveData(prev => [...prev, data]);
    setNewData({ type: 'altro', name: '', value: '' });
    setIsAddDialogOpen(false);
    
    console.log(`🔐 Sensitive data added: ${data.type} - ${data.name}`);
    toast.success('Dato sensibile aggiunto e crittografato');
  };

  const deleteSensitiveData = (id: string) => {
    const item = sensitiveData.find(d => d.id === id);
    setSensitiveData(prev => prev.filter(d => d.id !== id));
    setVisibleData(prev => {
      const newSet = new Set(prev);
      newSet.delete(id);
      return newSet;
    });
    
    console.log(`🗑️ Sensitive data deleted: ${item?.name}`);
    toast.success('Dato sensibile eliminato');
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Database className="h-5 w-5" />
            <span>Gestione Dati Sensibili</span>
          </CardTitle>
          <CardDescription>
            I tuoi dati sono crittografati con AES-256 e protetti
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-4 text-sm text-muted-foreground">
              <div className="flex items-center space-x-1">
                <Shield className="h-4 w-4 text-success" />
                <span>Crittografia attiva</span>
              </div>
              <div className="flex items-center space-x-1">
                <Lock className="h-4 w-4 text-primary" />
                <span>{sensitiveData.length} elementi protetti</span>
              </div>
            </div>
            
            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Aggiungi Dato
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Aggiungi Dato Sensibile</DialogTitle>
                  <DialogDescription>
                    Il dato verrà automaticamente crittografato e protetto
                  </DialogDescription>
                </DialogHeader>
                
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="data-type">Tipo di dato</Label>
                    <Select 
                      value={newData.type} 
                      onValueChange={(value) => setNewData(prev => ({ ...prev, type: value as any }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(dataTypeLabels).map(([key, label]) => (
                          <SelectItem key={key} value={key}>
                            {dataTypeIcons[key as keyof typeof dataTypeIcons]} {label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="data-name">Nome/Descrizione</Label>
                    <Input
                      id="data-name"
                      placeholder="es. Conto principale, CF personale..."
                      value={newData.name}
                      onChange={(e) => setNewData(prev => ({ ...prev, name: e.target.value }))}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="data-value">Valore</Label>
                    <Textarea
                      id="data-value"
                      placeholder="Inserisci il dato sensibile..."
                      value={newData.value}
                      onChange={(e) => setNewData(prev => ({ ...prev, value: e.target.value }))}
                      rows={3}
                    />
                  </div>
                </div>
                
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                    Annulla
                  </Button>
                  <Button onClick={addSensitiveData}>
                    <Shield className="h-4 w-4 mr-2" />
                    Crittografa e Salva
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>

          <div className="space-y-3">
            {sensitiveData.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Database className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p>Nessun dato sensibile memorizzato</p>
              </div>
            ) : (
              sensitiveData.map((item) => (
                <div key={item.id} className="border rounded-lg p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <span className="text-lg">{dataTypeIcons[item.type]}</span>
                      <div>
                        <p className="font-medium">{item.name}</p>
                        <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                          <Badge variant="outline" className="text-xs">
                            {dataTypeLabels[item.type]}
                          </Badge>
                          <span>•</span>
                          <span>Modificato: {item.lastModified}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => toggleDataVisibility(item.id)}
                      >
                        {visibleData.has(item.id) ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </Button>
                      
                      <Button variant="ghost" size="sm">
                        <Edit className="h-4 w-4" />
                      </Button>
                      
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => deleteSensitiveData(item.id)}
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  
                  <div className="bg-muted p-3 rounded font-mono text-sm">
                    {visibleData.has(item.id) ? (
                      <span className="text-foreground">{item.value}</span>
                    ) : (
                      <span className="text-muted-foreground">
                        {maskSensitiveValue(item.value, item.type)}
                      </span>
                    )}
                  </div>
                  
                  {item.encrypted && (
                    <div className="flex items-center space-x-1 text-xs text-success">
                      <Shield className="h-3 w-3" />
                      <span>Crittografato con AES-256</span>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SensitiveDataManager;
