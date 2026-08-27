import { http } from './http';
import { Page } from '../types/api';
import { TarefaConclusaoRequest, TarefaRequest, TarefaResponse } from '../types/task';

export const TaskService = {
  // Lista todas as tarefas paginadas
  async getTarefas(page = 0, size = 50): Promise<Page<TarefaResponse>> {
    const response = await http.get<Page<TarefaResponse>>('/tarefas', {
      params: { page, size, sort: 'prazo,asc' },
    });
    return response.data;
  },

  // Lista tarefas pendentes do usuário
  async getTarefasPorUsuario(usuarioId: number, page = 0, size = 50): Promise<Page<TarefaResponse>> {
    const response = await http.get<Page<TarefaResponse>>('/tarefas/by-usuario', {
      params: { usuarioId, page, size, sort: 'prazo,asc' },
    });
    return response.data;
  },

  // Busca tarefa por ID
  async getTarefaById(id: number): Promise<TarefaResponse> {
    const response = await http.get<TarefaResponse>(`/tarefas/${id}`);
    return response.data;
  },

  // Cria uma nova tarefa na API Java
  async createTarefa(tarefaRequest: TarefaRequest): Promise<TarefaResponse> {
    const response = await http.post<TarefaResponse>('/tarefas', tarefaRequest);
    return response.data;
  },

  // Atualiza uma tarefa existente
  async updateTarefa(id: number, tarefaRequest: TarefaRequest): Promise<TarefaResponse> {
    const response = await http.put<TarefaResponse>(`/tarefas/${id}`, tarefaRequest);
    return response.data;
  },

  // Conclui uma tarefa somando pontos ao cuidador e ao pet
  async concluirTarefa(id: number, request: TarefaConclusaoRequest): Promise<TarefaResponse> {
    const response = await http.patch<TarefaResponse>(`/tarefas/${id}/concluir`, request);
    return response.data;
  },

  // Consulta o total de pontos acumulados por um usuário
  async getPontosUsuario(usuarioId: number): Promise<number> {
    const response = await http.get<number>('/tarefas/by-usuario/pontos', {
      params: { usuarioId },
    });
    return response.data;
  },

  // Remove uma tarefa
  async deleteTarefa(id: number): Promise<void> {
    await http.delete(`/tarefas/${id}`);
  },
};
