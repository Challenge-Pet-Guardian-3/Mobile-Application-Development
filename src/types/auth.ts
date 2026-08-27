import { UsuarioResponse } from './user';

export interface LoginCredentials {
  email: string;
  senha?: string;
}

export interface RegisterCredentials {
  nome: string;
  email: string;
  senha: string;
  ddd: string;
  numeroTelefone: string;
  cep: string;
  numero: string;
}

export interface AuthSession {
  user: UsuarioResponse | null;
  token: string | null;
  isAuthenticated: boolean;
}
