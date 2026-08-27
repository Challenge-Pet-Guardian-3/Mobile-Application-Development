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
  nivel: number;
  icone: string;
  cor: string;
  licoes: TrainingLesson[];
}
