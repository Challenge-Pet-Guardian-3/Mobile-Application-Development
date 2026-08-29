import { UsuarioResponse, UsuarioRole } from './user';

export interface LoginCredentials {
  email: string;
  senha: string;
}

export interface RegisterCredentials {
  nome: string;
  email: string;
  senha: string;
  ddd: string;
  numeroTelefone: string;
  role: UsuarioRole;
  cep: string;
  numero: string;
}

export interface LoginResponse {
  token: string;
  user: UsuarioResponse;
}

export interface AuthSession {
  user: UsuarioResponse | null;
  token: string | null;
  isAuthenticated: boolean;
}
