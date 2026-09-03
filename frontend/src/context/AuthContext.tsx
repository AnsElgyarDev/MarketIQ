import React, { createContext, useContext, useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import type { AuthSession } from '../services/auth';
import { getStoredSession, persistSession, clearSession } from '../services/auth';

type AuthContextValue = {
  session: AuthSession | null;
  isAuthenticated: boolean;
  login: (session: AuthSession) => void;
  logout: () => void;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [session, setSession] = useState<AuthSession | null>(null);

  useEffect(() => {
    const existing = getStoredSession();
    if (existing) setSession(existing);
  }, []);

  const login = (s: AuthSession) => {
    persistSession(s);
    setSession(s);
  };

  const logout = () => {
    clearSession();
    setSession(null);
    try {
      // best-effort: clear cookies/session-managed things by reloading
      window.location.href = '/';
    } catch {
      // ignore
    }
  };

  return (
    <AuthContext.Provider value={{ session, isAuthenticated: !!session, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
  return ctx;
}
