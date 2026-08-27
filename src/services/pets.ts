import { http } from './http';
import { Page } from '../types/api';
import { PetHistoryResponse, PetRequest, PetResponse } from '../types/pet';

export const PetService = {
  // Lista todos os pets paginados
  async getPets(page = 0, size = 20): Promise<Page<PetResponse>> {
    const response = await http.get<Page<PetResponse>>('/pets', {
      params: { page, size, sort: 'nome,asc' },
    });
    return response.data;
  },

  // Busca pets por nome
  async getPetsByNome(nome: string, page = 0, size = 20): Promise<Page<PetResponse>> {
    const response = await http.get<Page<PetResponse>>('/pets/by-nome', {
      params: { nome, page, size },
    });
    return response.data;
  },

  // Busca detalhes de um pet específico por ID
  async getPetById(id: number): Promise<PetResponse> {
    const response = await http.get<PetResponse>(`/pets/${id}`);
    return response.data;
  },

  // Busca histórico consolidado de cuidados do pet
  async getPetHistory(id: number): Promise<PetHistoryResponse> {
    const response = await http.get<PetHistoryResponse>(`/pets/${id}/historico`);
    return response.data;
  },

  // Cria um novo pet vinculado ao usuário
  async createPet(petRequest: PetRequest): Promise<PetResponse> {
    const response = await http.post<PetResponse>('/pets', petRequest);
    return response.data;
  },

  // Atualiza os dados de um pet existente
  async updatePet(id: number, petRequest: PetRequest): Promise<PetResponse> {
    const response = await http.put<PetResponse>(`/pets/${id}`, petRequest);
    return response.data;
  },

  // Exclui um pet do sistema
  async deletePet(id: number): Promise<void> {
    await http.delete(`/pets/${id}`);
  },

  // Vincula um usuário a um pet
  async vincularUsuario(petId: number, usuarioId: number, principal = false): Promise<void> {
    await http.post(`/pets/${petId}/usuarios/${usuarioId}`, null, {
      params: { principal },
    });
  },

  // Desvincula um usuário de um pet
  async desvincularUsuario(petId: number, usuarioId: number): Promise<void> {
    await http.delete(`/pets/${petId}/usuarios/${usuarioId}`);
  },

  // Convida co-cuidador por e-mail
  async convidarPorEmail(petId: number, responsavelPrincipalId: number, email: string): Promise<void> {
    await http.post(`/pets/${petId}/convidar-email`, null, {
      params: { responsavelPrincipalId, email: email.trim().toLowerCase() },
    });
  },

  // Convida co-cuidador por ID
  async convidarPorId(petId: number, responsavelPrincipalId: number, usuarioConvidadoId: number): Promise<void> {
    await http.post(`/pets/${petId}/convidar`, null, {
      params: { responsavelPrincipalId, usuarioConvidadoId },
    });
  },
};
