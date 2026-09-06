export type DificuldadeTreino = 'FACIL' | 'MEDIO' | 'AVANCADO';

export interface TrainingLesson {
  id: string;
  titulo: string;
  descricao: string;
  pontos: number;
  icone: string;
  duracaoMin: number;
  concluido: boolean;
  passos: string[];
}

export interface TrainingTrack {
  id: string;
  categoria: string;
  titulo: string;
  descricao: string;
  icone: string;
  cor: string;
  licoes: TrainingLesson[];
}

export interface TrilhaApiResponse {
  id: number;
  nome: string;
  descricao: string;
  petId: number;
}

export interface ModuloApiResponse {
  id: number;
  nome: string;
  tempoConclusao: string;
  descricao: string;
  trilhaId: number;
}

export interface AulaApiResponse {
  id: number;
  nome: string;
  descricao: string;
  pontosAula: number;
  dificuldade: string;
  conteudo: string;
  concluida: boolean;
  moduloId: number;
}
