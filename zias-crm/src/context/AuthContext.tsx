import { createContext, useContext, useState, type ReactNode } from "react";
import { authApi } from "../services/api";
import type { User } from "../types";

interface AuthContextValue {
  user: User | null;
  login: (username: string, password: string) => Promise<void>;
  register: (username: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

// Restore the session after a page refresh.
const readStoredUser = (): User | null => {
  const username = localStorage.getItem("username");
  const token = localStorage.getItem("access");
  return username && token ? { username, token } : null;
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(readStoredUser);

  const login = async (username: string, password: string) => {
    const response = await authApi.login(username, password);
    setUser(response.data);
  };

  const register = async (username: string, password: string) => {
    const response = await authApi.register(username, password);
    setUser(response.data);
  };

  const logout = async () => {
    await authApi.logout();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used inside AuthProvider");
  return context;
}