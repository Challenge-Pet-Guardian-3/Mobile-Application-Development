import AsyncStorage from '@react-native-async-storage/async-storage';
import { http } from './http';
import { STORAGE_KEYS } from '../constants/Keys';
import { UsuarioRequest, UsuarioResponse } from '../types/user';
import { LoginCredentials, RegisterCredentials } from '../types/auth';

export const AuthService = {
  // Realiza o cadastro do tutor
  async register(data: RegisterCredentials): Promise<UsuarioResponse> {
    const payload: UsuarioRequest = {
      nome: data.nome.trim(),
      email: data.email.trim().toLowerCase(),
      senha: data.senha,
      ddd: data.ddd.replace(/\D/g, '') || '11',
      numeroTelefone: data.numeroTelefone.replace(/\D/g, '') || '987654321',
      endereco: {
        cep: data.cep.replace(/\D/g, '') || '01310100',
        numero: data.numero.trim() || '100',
      },
    };

    const response = await http.post<UsuarioResponse>('/usuarios', payload);
    return response.data;
  },

  // Realiza login no Spring Security (POST /login)
  async login(credentials: LoginCredentials): Promise<{ user: UsuarioResponse; token: string }> {
    const emailFormatado = credentials.email.trim().toLowerCase();

    const response = await http.post<{ token: string; user: UsuarioResponse }>('/login', {
      email: emailFormatado,
      senha: credentials.senha,
    });

    const { user, token } = response.data;
    await AsyncStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, token);
    await AsyncStorage.setItem(STORAGE_KEYS.AUTH_USER, JSON.stringify(user));
    await AsyncStorage.setItem(STORAGE_KEYS.LOGADO, 'sim');
    return { user, token };
  },

  // Recupera a sessão atual do storage
  async getStoredSession(): Promise<{ user: UsuarioResponse | null; token: string | null }> {
    try {
      const token = await AsyncStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
      const userStr = await AsyncStorage.getItem(STORAGE_KEYS.AUTH_USER);
      if (token && userStr) {
        const user = JSON.parse(userStr) as UsuarioResponse;
        return { user, token };
      }
    } catch (e) {
      console.warn('[AuthService] Erro ao recuperar sessão do storage:', e);
    }
    return { user: null, token: null };
  },

  // Finaliza a sessão limpando os tokens
  async logout(): Promise<void> {
    try {
      await AsyncStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN);
      await AsyncStorage.removeItem(STORAGE_KEYS.AUTH_USER);
      await AsyncStorage.removeItem(STORAGE_KEYS.LOGADO);
      await AsyncStorage.removeItem(STORAGE_KEYS.ACTIVE_PET_ID);
    } catch (e) {
      console.warn('[AuthService] Erro no logout:', e);
    }
  },
};
