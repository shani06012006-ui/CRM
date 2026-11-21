//src/context/AuthContext.tsx

import { createContext, useState, useEffect, ReactNode } from 'react';
import { User } from '../interfaces';
import { authService } from '../services/crmService';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
  loading: boolean;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('crm_token');
    const savedUser = localStorage.getItem('crm_user');
    if (token && savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch {
        localStorage.removeItem('crm_user');
      }
    }
    setLoading(false);
  }, []);

  const login = async (username: string, password: string) => {
    const response = await authService.login({ username, password });
    localStorage.setItem('crm_user', JSON.stringify(response.user));
    setUser(response.user);
  };

  const logout = () => {
    localStorage.removeItem('crm_token');
    localStorage.removeItem('crm_refresh');
    localStorage.removeItem('crm_user');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};