import { User } from '@/contexts/authTypes';

// Mock user data per development finché non implementi l'API /auth/me
export const createMockUser = (email?: string, name?: string, surname?: string): User => {
  // Se abbiamo dati dal login/registrazione, usiamo quelli
  if (email && name && surname) {
    return {
      id: 1,
      email,
      name,
      surname,
      totpEnabled: false
    };
  }

  // Altrimenti usiamo dati mock di default
  return {
    id: 1,
    email: 'mario.rossi@example.com',
    name: 'Mario',
    surname: 'Rossi',
    totpEnabled: false
  };
};

// Mock user per quando siamo già autenticati ma non abbiamo dati utente
export const getMockAuthenticatedUser = (): User => {
  return {
    id: 1,
    email: 'mario.rossi@example.com',
    name: 'Mario',
    surname: 'Rossi',
    totpEnabled: false
  };
};

// Simula i dati che arriverebbero dall'API /auth/me
export const mockUserApiResponse = {
  id: 1,
  email: 'mario.rossi@example.com',
  name: 'Mario',
  surname: 'Rossi',
  totp_enabled: false,
  created_at: '2025-01-01T10:00:00Z',
  updated_at: '2025-01-13T10:00:00Z'
};

// Lista di utenti mock per testing
export const mockUsers: User[] = [
  {
    id: 1,
    email: 'mario.rossi@example.com',
    name: 'Mario',
    surname: 'Rossi',
    totpEnabled: false
  },
  {
    id: 2,
    email: 'giulia.bianchi@example.com',
    name: 'Giulia',
    surname: 'Bianchi',
    totpEnabled: true
  },
  {
    id: 3,
    email: 'luca.verdi@example.com',
    name: 'Luca',
    surname: 'Verdi',
    totpEnabled: false
  }
];

// Trova un mock user per email (utile per login)
export const findMockUserByEmail = (email: string): User | null => {
  return mockUsers.find(user => user.email === email) || null;
};
