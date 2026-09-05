import { PetResponse } from './pet';
import { TarefaResponse } from './task';
import { UsuarioResponse } from './user';

export * from './api';
export * from './auth';
export * from './user';
export * from './pet';
export * from './task';
export * from './clinic';
export * from './training';
export * from './ai';

// Aliases de conveniência
export type Pet = PetResponse;
export type Tarefa = TarefaResponse;
export type Usuario = UsuarioResponse;

export interface DiaOfensiva {
  id: string;
  dayLabel: string;
  dayNumber: string;
  done: boolean;
  isToday?: boolean;
}
