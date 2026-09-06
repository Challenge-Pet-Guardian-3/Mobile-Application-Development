import { http } from './http';
import { TrainingLesson, TrainingTrack, TrilhaApiResponse, ModuloApiResponse, AulaApiResponse } from '../types/training';

export const TrainingService = {
  // Busca trilhas reais associadas a um pet na API Java de forma concorrente com Promise.all
  async getTrilhas(petId?: number): Promise<TrainingTrack[]> {
    if (!petId) {
      return [];
    }

    try {
      const response = await http.get<TrilhaApiResponse[]>(`/trilhas/pet/${petId}`);
      if (!response.data || response.data.length === 0) {
        return [];
      }

      const tracks = await Promise.all(
        response.data.map(async (t) => {
          try {
            const modulosResp = await http.get<ModuloApiResponse[]>(`/modulos/trilha/${t.id}`);
            const modulos = modulosResp.data || [];

            const modulosLicoes = await Promise.all(
              modulos.map(async (m) => {
                try {
                  const aulasResp = await http.get<AulaApiResponse[]>(`/aulas/modulo/${m.id}`);
                  const aulas = aulasResp.data || [];
                  return aulas.map((a): TrainingLesson => ({
                    id: String(a.id),
                    titulo: a.nome,
                    descricao: a.descricao,
                    pontos: a.pontosAula,
                    icone: 'paw',
                    duracaoMin: Number(m.tempoConclusao) || 5,
                    concluido: a.concluida,
                    passos: a.conteudo
                      ? a.conteudo.split('\n').filter(Boolean)
                      : ['Siga as orientações práticas desta aula.'],
                  }));
                } catch {
                  return [] as TrainingLesson[];
                }
              })
            );

            return {
              id: String(t.id),
              categoria: 'Adestramento',
              titulo: t.nome,
              descricao: t.descricao,
              icone: 'dog',
              cor: '#0066FF',
              licoes: modulosLicoes.flat(),
            } as TrainingTrack;
          } catch {
            return {
              id: String(t.id),
              categoria: 'Adestramento',
              titulo: t.nome,
              descricao: t.descricao,
              icone: 'dog',
              cor: '#0066FF',
              licoes: [],
            } as TrainingTrack;
          }
        })
      );

      return tracks;
    } catch {
      return [];
    }
  },


  async getTrilhaById(id: string, petId?: number): Promise<TrainingTrack | undefined> {
    const trilhas = await this.getTrilhas(petId);
    return trilhas.find((t) => t.id === id);
  },

  // Conclui aula chamando o endpoint dedicado PATCH /aulas/{id}/concluir
  async concluirLicao(_trilhaId: string, licaoId: string): Promise<{ pontosGanhos: number }> {
    const numId = Number(licaoId);
    if (!isNaN(numId) && numId > 0) {
      const response = await http.patch<AulaApiResponse>(`/aulas/${numId}/concluir`);
      return { pontosGanhos: response.data.pontosAula };
    }
    return { pontosGanhos: 25 };
  },

  // Desmarca aula chamando o endpoint dedicado PATCH /aulas/{id}/desmarcar
  async desmarcarLicao(_trilhaId: string, licaoId: string): Promise<void> {
    const numId = Number(licaoId);
    if (!isNaN(numId) && numId > 0) {
      await http.patch<AulaApiResponse>(`/aulas/${numId}/desmarcar`);
    }
  },
};
