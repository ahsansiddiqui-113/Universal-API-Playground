'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { getCurrentUser, logout as logoutRequest } from '@/lib/auth';
import { NetworkError } from '@/lib/http';
import type { AuthUser } from '@/lib/auth';

type AuthContextValue = {
  user: AuthUser | null;
  loading: boolean;
  /** true when the backend is unreachable (not an auth error) */
  backendOffline: boolean;
  refreshUser: () => Promise<AuthUser | null>;
  setAuthenticatedUser: (user: AuthUser | null) => void;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [backendOffline, setBackendOffline] = useState(false);

  const refreshUser = useCallback(async () => {
    try {
      const nextUser = await getCurrentUser();
      setUser(nextUser);
      setBackendOffline(false);
      return nextUser;
    } catch (err) {
      if (err instanceof NetworkError) {
        setBackendOffline(true);
      } else {
        setBackendOffline(false);
      }
      setUser(null);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refreshUser();
  }, [refreshUser]);

  const logout = useCallback(async () => {
    try {
      await logoutRequest();
    } finally {
      setUser(null);
    }
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      loading,
      backendOffline,
      refreshUser,
      setAuthenticatedUser: setUser,
      logout,
    }),
    [backendOffline, loading, logout, refreshUser, user],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used inside AuthProvider');
  }
  return context;
}

