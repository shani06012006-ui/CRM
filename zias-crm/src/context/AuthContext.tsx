import { createContext, useState, useEffect, ReactNode } from 'react';
import { User } from '../interfaces';
import { authService } from '../services/crmService';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (username: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  updateUser: (user: User) => void;
  loading: boolean;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

const clearLocalSession = () => {
  localStorage.removeItem('crm_token');
  localStorage.removeItem('crm_refresh');
  localStorage.removeItem('crm_user');
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // On page load, restore the user from the server instead of trusting localStorage
  useEffect(() => {
    if (!localStorage.getItem('crm_token')) {
      setLoading(false);
      return;
    }
    authService
      .me()
      .then(setUser)
      .catch(() => clearLocalSession())
      .finally(() => setLoading(false));
  }, []);

  const login = async (username: string, password: string) => {
    await authService.login(username, password);
    const me = await authService.me();
    setUser(me);
  };

  const logout = async () => {
    await authService.logout();
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{ user, isAuthenticated: !!user, login, logout, updateUser: setUser, loading }}
    >
      {children}
    </AuthContext.Provider>
  );
};