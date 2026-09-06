export type EnumStatus = 'PENDENTE' | 'CONCLUIDO' | 'EXPIRADO';

export interface TarefaRequest {
  titulo: string;
  pontosTarefa: number;
  descricao: string;
  prazo: string; // ISO 8601 LocalDateTime
  usuarioId: number;
  petId: number;
  status: EnumStatus;
  conclusao?: string | null;
}

export interface TarefaConclusaoRequest {
  concluinteId: number;
}

export interface TarefaResponse {
  id: number;
  titulo: string;
  pontosTarefa: number;
  descricao: string;
  criacao: string;
  prazo: string;
  conclusao: string | null;
  status: EnumStatus;
  usuarioId: number;
  petId: number;
}
