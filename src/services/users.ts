import { http } from './http';
import { Page } from '../types/api';
import { RedeCuidadoResponse, UsuarioRequest, UsuarioResponse } from '../types/user';

export const UserService = {
  // Lista todos os usuários paginados
  async getUsuarios(page = 0, size = 20): Promise<Page<UsuarioResponse>> {
    const response = await http.get<Page<UsuarioResponse>>('/usuarios', {
      params: { page, size },
    });
    return response.data;
  },

  // Busca usuários por nome
  async getUsuariosByNome(nome: string, page = 0, size = 20): Promise<Page<UsuarioResponse>> {
    const response = await http.get<Page<UsuarioResponse>>('/usuarios/by-nome', {
      params: { nome, page, size },
    });
    return response.data;
  },

  // Busca usuário por ID
  async getUsuarioById(id: number): Promise<UsuarioResponse> {
    const response = await http.get<UsuarioResponse>(`/usuarios/${id}`);
    return response.data;
  },

  // Busca usuário por e-mail
  async getUsuarioByEmail(email: string): Promise<UsuarioResponse> {
    const response = await http.get<UsuarioResponse>('/usuarios/by-email', {
      params: { email: email.trim().toLowerCase() },
    });
    return response.data;
  },

  // Visualiza rede de cuidado do usuário (pets, co-cuidadores e tarefas agrupadas)
  async getRedeCuidado(usuarioId: number): Promise<RedeCuidadoResponse> {
    const response = await http.get<RedeCuidadoResponse>(`/usuarios/${usuarioId}/rede-cuidado`);
    return response.data;
  },

  // Atualiza dados do usuário
  async updateUsuario(id: number, usuarioRequest: UsuarioRequest): Promise<UsuarioResponse> {
    const response = await http.put<UsuarioResponse>(`/usuarios/${id}`, usuarioRequest);
    return response.data;
  },

  // Deleta o usuário
  async deleteUsuario(id: number): Promise<void> {
    await http.delete(`/usuarios/${id}`);
  },
};
