import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useQueryClient } from '@tanstack/react-query';
import { api } from '../services/api';
import { STORAGE_KEYS } from '../constants/Keys';

export interface UserData {
  id: number;
  nome: string;
  email: string;
}

interface AuthContextData {
  userData: UserData | null;
  token: string | null;
  isLoading: boolean;
  signIn: (token: string, user: UserData) => Promise<void>;
  signOut: () => Promise<void>;
  updateUserData: (user: Partial<UserData>) => Promise<void>;
}

const AuthContext = createContext<AuthContextData>({} as AuthContextData);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [userData, setUserData] = useState<UserData | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const queryClient = useQueryClient();

  useEffect(() => {
    async function carregarSessao() {
      try {
        const tokenSalvo = await AsyncStorage.getItem(STORAGE_KEYS.TOKEN);
        const userSalvo = await AsyncStorage.getItem(STORAGE_KEYS.USER_DATA);

        if (tokenSalvo && userSalvo && tokenSalvo !== 'null' && tokenSalvo !== 'undefined') {
          // Único lugar que seta o header — feito de forma síncrona ANTES de
          // liberar userData/isLoading, então quando as telas disparam suas
          // queries (gated por `enabled: Boolean(usuarioId)`), o header já
          // está garantidamente pronto no Axios.
          api.defaults.headers.common['Authorization'] = `Bearer ${tokenSalvo}`;
          setToken(tokenSalvo);
          setUserData(JSON.parse(userSalvo));
        } else {
          delete api.defaults.headers.common['Authorization'];
        }
      } catch (error) {
        console.error('Erro ao restaurar sessão:', error);
        delete api.defaults.headers.common['Authorization'];
      } finally {
        setIsLoading(false);
      }
    }
    carregarSessao();
  }, []);

  const signIn = async (novoToken: string, novoUser: UserData) => {
    // Limpa caches residuais
    queryClient.clear();

    api.defaults.headers.common['Authorization'] = `Bearer ${novoToken}`;
    await AsyncStorage.setItem(STORAGE_KEYS.TOKEN, novoToken);
    await AsyncStorage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(novoUser));
    await AsyncStorage.setItem(STORAGE_KEYS.LOGADO, 'true');

    setToken(novoToken);
    setUserData(novoUser);
  };

  const signOut = async () => {
    try {
      // 1. Limpa todas as consultas em cache do TanStack Query
      queryClient.clear();

      // 2. Remove os dados salvos da sessão no storage
      await AsyncStorage.multiRemove([
        STORAGE_KEYS.TOKEN,
        STORAGE_KEYS.USER_DATA,
        STORAGE_KEYS.LOGADO,
        STORAGE_KEYS.FAMILIA_ATIVA,
        STORAGE_KEYS.NOME_FAMILIA,
        STORAGE_KEYS.CODIGO_FAMILIA,
        STORAGE_KEYS.CUIDADORES,
        STORAGE_KEYS.RECADOS,
        STORAGE_KEYS.LISTA_PETS,
      ]);

      delete api.defaults.headers.common['Authorization'];
      setToken(null);
      setUserData(null);
    } catch (error) {
      console.error('Erro ao encerrar sessão:', error);
    }
  };

  const updateUserData = async (novosDados: Partial<UserData>) => {
    if (!userData) return;
    const atualizado = { ...userData, ...novosDados };
    await AsyncStorage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(atualizado));
    setUserData(atualizado as UserData);
  };

  return (
    <AuthContext.Provider value={{ userData, token, isLoading, signIn, signOut, updateUserData }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);