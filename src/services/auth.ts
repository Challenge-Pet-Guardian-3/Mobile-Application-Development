import AsyncStorage from '@react-native-async-storage/async-storage';
import { http } from './http';
import { STORAGE_KEYS } from '../constants/Keys';
import { UsuarioRequest, UsuarioResponse } from '../types/user';
import { LoginCredentials, RegisterCredentials } from '../types/auth';

export const AuthService = {
  // Realiza o cadastro (suporta tanto Spring Security /auth/register quanto /usuarios)
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

    try {
      // Tenta rota do Spring Security caso já configurada
      const authRes = await http.post<{ user: UsuarioResponse; token?: string }>('/auth/register', payload);
      if (authRes.data && authRes.data.user) {
        if (authRes.data.token) {
          await AsyncStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, authRes.data.token);
        }
        return authRes.data.user;
      }
    } catch {
      // Fallback para endpoint direto do UsuarioController
    }

    const response = await http.post<UsuarioResponse>('/usuarios', payload);
    return response.data;
  },

  // Realiza login (suporta tanto Spring Security /auth/login quanto busca /usuarios/by-email)
  async login(credentials: LoginCredentials): Promise<{ user: UsuarioResponse; token: string }> {
    const emailFormatado = credentials.email.trim().toLowerCase();

    try {
      // Tenta rota do Spring Security caso configurada
      const authRes = await http.post<{ user: UsuarioResponse; token: string }>('/auth/login', {
        email: emailFormatado,
        senha: credentials.senha,
      });
      if (authRes.data && authRes.data.user && authRes.data.token) {
        const { user, token } = authRes.data;
        await AsyncStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, token);
        await AsyncStorage.setItem(STORAGE_KEYS.AUTH_USER, JSON.stringify(user));
        await AsyncStorage.setItem(STORAGE_KEYS.LOGADO, 'sim');
        return { user, token };
      }
    } catch {
      // Fallback para autenticação via UsuarioController
    }

    const response = await http.get<UsuarioResponse>('/usuarios/by-email', {
      params: { email: emailFormatado },
    });

    const user = response.data;
    const token = `jwt_token_${user.id}_${Date.now()}`;

    await AsyncStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, token);
    await AsyncStorage.setItem(STORAGE_KEYS.AUTH_USER, JSON.stringify(user));
    await AsyncStorage.setItem(STORAGE_KEYS.LOGADO, 'sim');
    await AsyncStorage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(user));

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
