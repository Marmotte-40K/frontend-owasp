
import React, { useState, useEffect } from 'react';
import { Activity, Shield, User, Database, AlertTriangle, CheckCircle, Filter, Search } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

interface ActivityLog {
  id: string;
  timestamp: string;
  type: 'login' | 'logout' | 'data_access' | 'data_modify' | 'security' | 'error';
  action: string;
  details: string;
  ip?: string;
  userAgent?: string;
  success: boolean;
}

const ActivityLogs: React.FC = () => {
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [filteredLogs, setFilteredLogs] = useState<ActivityLog[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');

  // Mock activity logs
  useEffect(() => {
    const mockLogs: ActivityLog[] = [
      {
        id: '1',
        timestamp: new Date().toISOString(),
        type: 'login',
        action: 'Login effettuato',
        details: 'Accesso riuscito con credenziali valide',
        ip: '192.168.1.100',
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
        success: true
      },
      {
        id: '2',
        timestamp: new Date(Date.now() - 300000).toISOString(), // 5 min ago
        type: 'data_access',
        action: 'Visualizzazione dati sensibili',
        details: 'Accesso ai dati IBAN - Conto principale',
        success: true
      },
      {
        id: '3',
        timestamp: new Date(Date.now() - 900000).toISOString(), // 15 min ago
        type: 'security',
        action: 'Tentativo 2FA',
        details: 'Verifica codice 2FA riuscita',
        success: true
      },
      {
        id: '4',
        timestamp: new Date(Date.now() - 1800000).toISOString(), // 30 min ago
        type: 'data_modify',
        action: 'Aggiunto dato sensibile',
        details: 'Nuovo elemento: Codice Fiscale - CF personale',
        success: true
      },
      {
        id: '5',
        timestamp: new Date(Date.now() - 3600000).toISOString(), // 1 hour ago
        type: 'error',
        action: 'Tentativo login fallito',
        details: 'Credenziali non valide per utente ***@***.com',
        ip: '192.168.1.100',
        success: false
      }
    ];
    
    setLogs(mockLogs);
    setFilteredLogs(mockLogs);
  }, []);

  // Filter logs based on search and type
  useEffect(() => {
    let filtered = logs;
    
    if (searchTerm) {
      filtered = filtered.filter(log => 
        log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.details.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    if (typeFilter !== 'all') {
      filtered = filtered.filter(log => log.type === typeFilter);
    }
    
    setFilteredLogs(filtered);
  }, [logs, searchTerm, typeFilter]);

  const getLogIcon = (type: string) => {
    switch (type) {
      case 'login':
      case 'logout':
        return User;
      case 'data_access':
      case 'data_modify':
        return Database;
      case 'security':
        return Shield;
      case 'error':
        return AlertTriangle;
      default:
        return Activity;
    }
  };

  const getLogColor = (type: string, success: boolean) => {
    if (!success) return 'text-destructive';
    
    switch (type) {
      case 'login':
        return 'text-success';
      case 'logout':
        return 'text-muted-foreground';
      case 'data_access':
        return 'text-primary';
      case 'data_modify':
        return 'text-warning';
      case 'security':
        return 'text-success';
      default:
        return 'text-foreground';
    }
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    return {
      date: date.toLocaleDateString('it-IT'),
      time: date.toLocaleTimeString('it-IT', { 
        hour: '2-digit', 
        minute: '2-digit', 
        second: '2-digit' 
      })
    };
  };

  const exportLogs = () => {
    const dataStr = JSON.stringify(filteredLogs, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `activity-logs-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
    
    console.log('📊 Activity logs exported');
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Activity className="h-5 w-5" />
            <span>Log delle Attività</span>
          </CardTitle>
          <CardDescription>
            Monitoraggio completo delle azioni di sicurezza
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Cerca nei log..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-full md:w-48">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tutti i tipi</SelectItem>
                <SelectItem value="login">Login/Logout</SelectItem>
                <SelectItem value="data_access">Accesso Dati</SelectItem>
                <SelectItem value="data_modify">Modifica Dati</SelectItem>
                <SelectItem value="security">Sicurezza</SelectItem>
                <SelectItem value="error">Errori</SelectItem>
              </SelectContent>
            </Select>
            
            <Button variant="outline" onClick={exportLogs}>
              Esporta Log
            </Button>
          </div>
          
          <div className="space-y-3">
            {filteredLogs.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Activity className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p>Nessun log trovato</p>
              </div>
            ) : (
              filteredLogs.map((log) => {
                const Icon = getLogIcon(log.type);
                const { date, time } = formatTimestamp(log.timestamp);
                
                return (
                  <div key={log.id} className="border rounded-lg p-4">
                    <div className="flex items-start space-x-3">
                      <div className={`p-2 rounded-full bg-muted ${getLogColor(log.type, log.success)}`}>
                        <Icon className="h-4 w-4" />
                      </div>
                      
                      <div className="flex-1 space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <h4 className="font-medium">{log.action}</h4>
                            {log.success ? (
                              <CheckCircle className="h-4 w-4 text-success" />
                            ) : (
                              <AlertTriangle className="h-4 w-4 text-destructive" />
                            )}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {date} • {time}
                          </div>
                        </div>
                        
                        <p className="text-sm text-muted-foreground">
                          {log.details}
                        </p>
                        
                        <div className="flex items-center space-x-4 text-xs text-muted-foreground">
                          {log.ip && (
                            <span>IP: {log.ip}</span>
                          )}
                          {log.userAgent && (
                            <span className="truncate max-w-xs">
                              UA: {log.userAgent}
                            </span>
                          )}
                          <Badge variant="outline" className="text-xs">
                            {log.type.replace('_', ' ').toUpperCase()}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </CardContent>
      </Card>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-5 w-5 text-success" />
              <div>
                <p className="text-sm font-medium">Azioni Riuscite</p>
                <p className="text-2xl font-bold">
                  {logs.filter(log => log.success).length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <AlertTriangle className="h-5 w-5 text-destructive" />
              <div>
                <p className="text-sm font-medium">Errori/Fallimenti</p>
                <p className="text-2xl font-bold">
                  {logs.filter(log => !log.success).length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Activity className="h-5 w-5 text-primary" />
              <div>
                <p className="text-sm font-medium">Totale Attività</p>
                <p className="text-2xl font-bold">{logs.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ActivityLogs;
