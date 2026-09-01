import { TarefaResponse } from './task';

export type PetPorte = 'PEQUENO' | 'MEDIO' | 'GRANDE';

export interface PetRequest {
  nome: string;
  dataNasc: string; // ISO format 'YYYY-MM-DD'
  raca: string;
  porte: PetPorte;
  sexo: string; // 'M' | 'F'
  castrado: boolean;
  usuarioId: number;
  idade?: number;
}

export interface PetResponse {
  id: number;
  nome: string;
  dataNasc: string; // ISO format 'YYYY-MM-DD'
  idade?: number;
  raca: string;
  porte: PetPorte;
  sexo: string;
  castrado: boolean;
  avatarId?: string;
  peso?: string;
  veterinario?: string;
  alergias?: string;
  medicamentos?: string;
  ultimaVacina?: string;
  ultimaConsulta?: string;
}

export interface PetHistoryResponse {
  petId: number;
  nomePet: string;
  tarefasConcluidas: TarefaResponse[];
}

export interface CoCuidadorResponse {
  usuarioId: number;
  nome: string;
  email: string;
  petId: number;
  nomePet: string;
  responsavelPrincipal: boolean;
}

export interface TransferirResponsabilidadeRequest {
  responsavelAtualId: number;
  novoResponsavelId: number;
}

export interface PetPontuacaoResponse {
  petId: number;
  nomePet: string;
  pontosTarefas: number;
  pontosAulas: number;
  pontosTotais: number;
}
