import { http } from './http';
import {
  TrainingLesson,
  TrainingTrack,
  TrilhaApiResponse,
  ModuloApiResponse,
  AulaApiResponse,
} from '../types/training';
import { mapearAulaParaLicao, mapearTrilhaParaTrack } from '../utils/trainingUtils';

/**
 * Serviço responsável pela comunicação HTTP com os endpoints de Treinamento/Trilhas do backend Java.
 */
export const TrainingService = {
  
  /**
   * Busca todas as trilhas cadastradas para um determinado pet (GET /trilhas/pet/{petId}).
   */
  async getTrilhasPorPet(petId: number): Promise<TrilhaApiResponse[]> {
    const response = await http.get<TrilhaApiResponse[]>(`/trilhas/pet/${petId}`);
    return response.data || [];
  },

  /**
   * Busca os módulos pertencentes a uma trilha (GET /modulos/trilha/{trilhaId}).
   */
  async getModulosPorTrilha(trilhaId: number): Promise<ModuloApiResponse[]> {
    const response = await http.get<ModuloApiResponse[]>(`/modulos/trilha/${trilhaId}`);
    return response.data || [];
  },

  /**
   * Busca as aulas pertencentes a um módulo (GET /aulas/modulo/{moduloId}).
   */
  async getAulasPorModulo(moduloId: number): Promise<AulaApiResponse[]> {
    const response = await http.get<AulaApiResponse[]>(`/aulas/modulo/${moduloId}`);
    return response.data || [];
  },

  /**
   * Conclui uma aula específica atribuindo seus pontos ao pet (PATCH /aulas/{id}/concluir).
   */
  async concluirAula(aulaId: number): Promise<AulaApiResponse> {
    const response = await http.patch<AulaApiResponse>(`/aulas/${aulaId}/concluir`);
    return response.data;
  },

  /**
   * Desmarca a conclusão de uma aula (PATCH /aulas/{id}/desmarcar).
   */
  async desmarcarAula(aulaId: number): Promise<AulaApiResponse> {
    const response = await http.patch<AulaApiResponse>(`/aulas/${aulaId}/desmarcar`);
    return response.data;
  },

  // === Métodos Compostos para Consumo da UI / Hooks ===

  /**
   * Busca a árvore completa de trilhas, módulos e aulas de um pet, transformando
   * os DTOs brutos da API Java nos ViewModels esperados pela interface (TrainingTrack[]).
   */
  async getTrilhas(petId?: number): Promise<TrainingTrack[]> {
    if (!petId) return [];

    try {
      const trilhas = await this.getTrilhasPorPet(petId);
      if (!trilhas.length) return [];

      return await Promise.all(
        trilhas.map(async (trilha, index) => {
          try {
            const modulos = await this.getModulosPorTrilha(trilha.id);

            const modulosComAulas = await Promise.all(
              modulos.map(async (modulo) => {
                try {
                  const aulas = await this.getAulasPorModulo(modulo.id);
                  return aulas.map((aula) => mapearAulaParaLicao(aula, modulo.tempoConclusao));
                } catch {
                  return [] as TrainingLesson[];
                }
              })
            );

            const licoes = modulosComAulas.flat();
            return mapearTrilhaParaTrack(trilha, licoes, index);
          } catch {
            return mapearTrilhaParaTrack(trilha, [], index);
          }
        })
      );
    } catch {
      return [];
    }
  },

  /**
   * Busca uma trilha específica por ID para exibição de detalhes.
   */
  async getTrilhaById(id: string, petId?: number): Promise<TrainingTrack | undefined> {
    const trilhas = await this.getTrilhas(petId);
    return trilhas.find((t) => t.id === id);
  },

  /**
   * Conclui a lição e retorna a quantidade de pontos obtidos.
   */
  async concluirLicao(_trilhaId: string, licaoId: string): Promise<{ pontosGanhos: number }> {
    const numId = Number(licaoId);
    if (!Number.isNaN(numId) && numId > 0) {
      const data = await this.concluirAula(numId);
      return { pontosGanhos: data.pontosAula };
    }
    return { pontosGanhos: 25 };
  },

  /**
   * Desmarca a conclusão da lição.
   */
  async desmarcarLicao(_trilhaId: string, licaoId: string): Promise<void> {
    const numId = Number(licaoId);
    if (!Number.isNaN(numId) && numId > 0) {
      await this.desmarcarAula(numId);
    }
  },
};
