/**
 * 🔐 Authentication Hook
 * Handles login, logout, and authentication state management
 */

'use client';

import React, { useState, useEffect, useCallback, createContext, useContext } from 'react';
import { apiClient } from '@/lib/api-client';

interface AuthContextType {
  isAuthenticated: boolean;
  token: string | null;
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
  loading: boolean;
  error: string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Check for existing token on mount
  useEffect(() => {
    const savedToken = localStorage.getItem('auth_token');
    if (savedToken) {
      setToken(savedToken);
      setIsAuthenticated(true);
    }
    setLoading(false);
  }, []);

  const login = useCallback(async (username: string, password: string) => {
    setLoading(true);
    setError(null);

    try {
      const response = await apiClient.login(username, password);
      setToken(response.access_token);
      setIsAuthenticated(true);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Login failed';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const logout = useCallback(() => {
    apiClient.logout();
    setToken(null);
    setIsAuthenticated(false);
    setError(null);
  }, []);

  const value = {
    isAuthenticated,
    token,
    login,
    logout,
    loading,
    error,
  };

  return React.createElement(AuthContext.Provider, { value }, children);
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

// Hook for protected routes
export function useRequireAuth() {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return { loading: true, authenticated: false };
  }

  if (!isAuthenticated) {
    return { loading: false, authenticated: false };
  }

  return { loading: false, authenticated: true };
}
