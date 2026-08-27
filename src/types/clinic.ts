export interface ClinicaResponse {
  id: number;
  nome: string;
  telefone: string;
  rua: string;
  numero: string;
  bairro: string;
  cidade: string;
  estado: string;
  atendimento24h: boolean;
  prontoSocorro: boolean;
  patrocinada: boolean;
  avaliacao: number;
  distanciaKm?: number;
  especialidades: string[];
}

export interface FiltroClinica {
  somente24h?: boolean;
  somenteProntoSocorro?: boolean;
  termoBusca?: string;
}
