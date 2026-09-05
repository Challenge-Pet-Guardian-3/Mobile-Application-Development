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

  // Lista tarefas do usuário com filtro opcional de status (ALL, PENDENTE, CONCLUIDO)
  async getTarefasPorUsuario(
    usuarioId: number,
    page = 0,
    size = 50,
    status?: string
  ): Promise<Page<TarefaResponse>> {
    const params: Record<string, unknown> = { usuarioId, page, size, sort: 'prazo,asc' };
    if (status) {
      params.status = status;
    }
    const response = await http.get<Page<TarefaResponse>>('/tarefas/by-usuario', { params });
    return response.data;
  },

  // Lista tarefas de um pet específico
  async getTarefasPorPet(petId: number, page = 0, size = 50): Promise<Page<TarefaResponse>> {
    const response = await http.get<Page<TarefaResponse>>(`/tarefas/by-pet/${petId}`, {
      params: { page, size, sort: 'prazo,asc' },
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

  // Desmarca uma tarefa concluída, retornando seu status para PENDENTE e estornando pontos
  async desmarcarTarefa(id: number, usuarioId: number): Promise<TarefaResponse> {
    const response = await http.patch<TarefaResponse>(`/tarefas/${id}/desmarcar`, null, {
      params: { usuarioId },
    });
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
