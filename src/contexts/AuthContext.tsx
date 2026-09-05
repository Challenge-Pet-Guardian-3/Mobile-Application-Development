import React, { createContext, useState, useEffect, useCallback, useMemo, ReactNode } from 'react';
import { AuthService } from '../services/auth';
import { setOnUnauthorizedCallback } from '../services/http';
import { queryClient } from '../lib/queryClient';
import { UsuarioResponse } from '../types/user';
import { LoginCredentials, RegisterCredentials } from '../types/auth';

export interface AuthContextData {
  user: UsuarioResponse | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (credentials: LoginCredentials) => Promise<void>;
  register: (credentials: RegisterCredentials) => Promise<void>;
  logout: () => Promise<void>;
  setUser: (user: UsuarioResponse | null) => void;
  setSession: (session: { user: UsuarioResponse | null; token: string | null }) => void;
}

export const AuthContext = createContext<AuthContextData>({} as AuthContextData);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<UsuarioResponse | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Carregar sessão persistida na inicialização
  useEffect(() => {
    const loadSession = async () => {
      try {
        const session = await AuthService.getStoredSession();
        if (session.user && session.token) {
          setUser(session.user);
          setToken(session.token);
        }
      } catch (error) {
        console.warn('[AuthProvider] Falha ao carregar sessão:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadSession();

    // Callback para interceptor 401
    setOnUnauthorizedCallback(() => {
      setUser(null);
      setToken(null);
      queryClient.clear();
    });
  }, []);

  const login = useCallback(async (credentials: LoginCredentials) => {
    setIsLoading(true);
    try {
      const result = await AuthService.login(credentials);
      setUser(result.user);
      setToken(result.token);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const register = useCallback(async (credentials: RegisterCredentials) => {
    setIsLoading(true);
    try {
      await AuthService.register(credentials);
      // Após o cadastro, realiza login com as mesmas credenciais
      const result = await AuthService.login({ email: credentials.email, senha: credentials.senha });
      setUser(result.user);
      setToken(result.token);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const logout = useCallback(async () => {
    setIsLoading(true);
    try {
      await AuthService.logout();
      setUser(null);
      setToken(null);
      queryClient.clear();
    } finally {
      setIsLoading(false);
    }
  }, []);

  const setSession = useCallback((session: { user: UsuarioResponse | null; token: string | null }) => {
    setUser(session.user);
    setToken(session.token);
  }, []);

  const value = useMemo(
    () => ({
      user,
      token,
      isAuthenticated: !!token && !!user,
      isLoading,
      login,
      register,
      logout,
      setUser,
      setSession,
    }),
    [user, token, isLoading, login, register, logout, setSession]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
