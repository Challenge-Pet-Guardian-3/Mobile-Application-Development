import { CLINICAS_CATALOGO } from '../constants/ClinicsCatalog';
import { ClinicaResponse, FiltroClinica } from '../types/clinic';

export const ClinicService = {
  // Retorna todas as clínicas parceiras ordenadas (patrocinadas no topo)
  async getClinicas(): Promise<ClinicaResponse[]> {
    const lista = [...CLINICAS_CATALOGO];
    lista.sort((a, b) => {
      if (a.patrocinada && !b.patrocinada) return -1;
      if (!a.patrocinada && b.patrocinada) return 1;
      return (a.distanciaKm || 0) - (b.distanciaKm || 0);
    });
    return lista;
  },

  // Filtra clínicas em memória conforme os critérios informados
  filtrarClinicas(clinicas: ClinicaResponse[], filtro?: FiltroClinica): ClinicaResponse[] {
    let resultado = clinicas;

    if (filtro?.somente24h) {
      resultado = resultado.filter((c) => c.atendimento24h);
    }
    if (filtro?.somenteProntoSocorro) {
      resultado = resultado.filter((c) => c.prontoSocorro);
    }
    if (filtro?.termoBusca && filtro.termoBusca.trim() !== '') {
      const termo = filtro.termoBusca.toLowerCase().trim();
      resultado = resultado.filter(
        (c) =>
          c.nome.toLowerCase().includes(termo) ||
          c.bairro.toLowerCase().includes(termo) ||
          c.especialidades.some((e) => e.toLowerCase().includes(termo))
      );
    }

    return resultado;
  },

  async getClinicaById(id: number): Promise<ClinicaResponse | undefined> {
    return CLINICAS_CATALOGO.find((c) => c.id === id);
  },
};

