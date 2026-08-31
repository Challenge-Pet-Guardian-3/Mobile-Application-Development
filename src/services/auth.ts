import { http } from './http';
import { StorageService } from './storage';
import { UsuarioRequest, UsuarioResponse } from '../types/user';
import { LoginCredentials, LoginResponse, RegisterCredentials } from '../types/auth';

export const AuthService = {
  // Realiza o cadastro do tutor
  async register(data: RegisterCredentials): Promise<UsuarioResponse> {
    const payload: UsuarioRequest = {
      nome: data.nome.trim(),
      email: data.email.trim().toLowerCase(),
      senha: data.senha,
      ddd: data.ddd.replace(/\D/g, '') || '11',
      numeroTelefone: data.numeroTelefone.replace(/\D/g, '') || '987654321',
      role: data.role || 'PREMIUM',
      endereco: {
        cep: data.cep.replace(/\D/g, '') || '01310100',
        numero: data.numero.trim() || '100',
      },
    };

    const response = await http.post<UsuarioResponse>('/usuarios', payload);
    return response.data;
  },

  // Realiza login no Spring Security (POST /login)
  async login(credentials: LoginCredentials): Promise<LoginResponse> {
    const emailFormatado = credentials.email.trim().toLowerCase();

    const response = await http.post<LoginResponse>('/login', {
      email: emailFormatado,
      senha: credentials.senha,
    });

    const { user, token } = response.data;
    await StorageService.saveToken(token);
    await StorageService.saveUser(user);
    return { user, token };
  },

  // Recupera a sessão atual (Token Seguro + Usuário)
  async getStoredSession(): Promise<{ user: UsuarioResponse | null; token: string | null }> {
    try {
      const [token, user] = await Promise.all([
        StorageService.getToken(),
        StorageService.getUser(),
      ]);

      if (token && user) {
        return { user, token };
      }
    } catch (e) {
      console.warn('[AuthService] Erro ao recuperar sessão do storage:', e);
    }
    return { user: null, token: null };
  },

  // Finaliza a sessão limpando os tokens seguros e dados locais
  async logout(): Promise<void> {
    try {
      await StorageService.clearAuthSession();
    } catch (e) {
      console.warn('[AuthService] Erro no logout:', e);
    }
  },
};
