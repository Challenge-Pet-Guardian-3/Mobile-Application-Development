export * from './api';
export * from './auth';
export * from './user';
export * from './pet';
export * from './task';
export * from './clinic';
export * from './training';
export * from './ai';

// Aliases de conveniência
export type Pet = import('./pet').PetResponse;
export type Tarefa = import('./task').TarefaResponse;
export type Usuario = import('./user').UsuarioResponse;

export interface DiaOfensiva {
  id: string;
  dayLabel: string;
  dayNumber: string;
  done: boolean;
  isToday?: boolean;
}
