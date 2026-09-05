import { http } from './http';
import { HistoricoRequest, HistoricoResponse } from '../types/historico';

export const HistoricoService = {
  // Lista eventos de histórico do pet ordenados por data mais recente (GET /historicos/pet/{petId})
  async getHistoricosByPetId(petId: number): Promise<HistoricoResponse[]> {
    const response = await http.get<HistoricoResponse[]>(`/historicos/pet/${petId}`);
    return response.data;
  },

  // Busca um registro específico de histórico por ID (GET /historicos/{id})
  async getHistoricoById(id: number): Promise<HistoricoResponse> {
    const response = await http.get<HistoricoResponse>(`/historicos/${id}`);
    return response.data;
  },

  // Cria um novo registro de histórico para um pet (POST /historicos)
  async createHistorico(data: HistoricoRequest): Promise<HistoricoResponse> {
    const response = await http.post<HistoricoResponse>('/historicos', data);
    return response.data;
  },

  // Atualiza um registro existente de histórico (PUT /historicos/{id})
  async updateHistorico(id: number, data: HistoricoRequest): Promise<HistoricoResponse> {
    const response = await http.put<HistoricoResponse>(`/historicos/${id}`, data);
    return response.data;
  },

  // Deleta um registro de histórico (DELETE /historicos/{id})
  async deleteHistorico(id: number): Promise<void> {
    await http.delete(`/historicos/${id}`);
  },
};
