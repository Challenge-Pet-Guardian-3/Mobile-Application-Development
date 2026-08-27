export * from './api';
export * from './auth';
export * from './user';
export * from './pet';
export * from './task';
export * from './clinic';
export * from './training';
export * from './ai';

// Tipos auxiliares de UI / Ofensiva / Legado mantidos para compatibilidade
export interface DiaOfensiva {
  id: number;
  dayLabel: string;
  dayNumber: string;
  status: 'feito' | 'perdido' | 'hoje' | 'futuro';
}

export interface Cuidador {
  id: string;
  nome: string;
  funcao: string;
  xp?: number;
}

export interface Recado {
  id: string;
  texto: string;
  hora: string;
  autor: string;
}

// Aliases para compatibilidade
export type Pet = import('./pet').PetResponse;
export type Tarefa = import('./task').TarefaResponse;
