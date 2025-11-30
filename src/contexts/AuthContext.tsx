import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, UserRole, PERMISSIONS } from '@/types';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  hasPermission: (permission: string) => boolean;
  isSuperAdmin: () => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Mock users for demo
const MOCK_USERS: User[] = [
  {
    id: '1',
    email: 'superadmin@taxpro.ca',
    name: 'John Smith',
    role: 'superadmin',
    permissions: Object.values(PERMISSIONS),
    isActive: true,
    createdAt: new Date(),
  },
  {
    id: '2',
    email: 'admin@taxpro.ca',
    name: 'Sarah Johnson',
    role: 'admin',
    permissions: [PERMISSIONS.ADD_EDIT_CLIENT, PERMISSIONS.REQUEST_DOCUMENTS, PERMISSIONS.UPDATE_WORKFLOW],
    isActive: true,
    createdAt: new Date(),
  },
];

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const storedUser = localStorage.getItem('taxpro_user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    const foundUser = MOCK_USERS.find(u => u.email === email);
    if (foundUser && password === 'demo123') {
      setUser(foundUser);
      localStorage.setItem('taxpro_user', JSON.stringify(foundUser));
      return true;
    }
    return false;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('taxpro_user');
  };

  const hasPermission = (permission: string): boolean => {
    if (!user) return false;
    if (user.role === 'superadmin') return true;
    return user.permissions.includes(permission);
  };

  const isSuperAdmin = (): boolean => {
    return user?.role === 'superadmin';
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, login, logout, hasPermission, isSuperAdmin }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
