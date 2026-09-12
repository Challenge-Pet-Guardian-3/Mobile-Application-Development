import { TrainingLesson, TrainingTrack, TrilhaApiResponse, AulaApiResponse } from '../types/training';
import { trainingPalette } from '../constants/theme';

/**
 * Heurística de apresentação que deduz a categoria visual e o ícone com base no título da trilha.
 */
export function resolveCategoriaEIcone(nome: string): { categoria: string; icone: string } {
  const n = (nome || '').toLowerCase();
  if (n.includes('cardiac') || n.includes('saude') || n.includes('higiene') || n.includes('ocular') || n.includes('imunidade')) {
    return { categoria: 'Saúde & Cuidados', icone: 'heart' };
  }
  if (n.includes('cogn') || n.includes('mental') || n.includes('jogos') || n.includes('enriquecimento') || n.includes('linguagem')) {
    return { categoria: 'Cognição & Jogos', icone: 'paw' };
  }
  if (n.includes('nutri') || n.includes('aliment') || n.includes('pelos') || n.includes('coelho')) {
    return { categoria: 'Nutrição & Manejo', icone: 'bone' };
  }
  if (n.includes('voo') || n.includes('ave') || n.includes('calopsita')) {
    return { categoria: 'Habilidades & Voo', icone: 'feather' };
  }
  return { categoria: 'Adestramento', icone: 'dog' };
}

/**
 * Converte o campo de tempo de conclusão (ex: "15 min") para um valor numérico em minutos.
 */
export function extrairMinutosDuracao(tempoConclusao?: string): number {
  if (!tempoConclusao) return 10;
  const num = Number(tempoConclusao.replace(/\D/g, ''));
  return Number.isFinite(num) && num > 0 ? num : 10;
}

/**
 * Mapeia o DTO de aula da API Java para o modelo de exibição da UI (TrainingLesson).
 */
export function mapearAulaParaLicao(aula: AulaApiResponse, tempoConclusao?: string): TrainingLesson {
  return {
    id: String(aula.id),
    titulo: aula.nome,
    descricao: aula.descricao,
    pontos: aula.pontosAula,
    icone: 'paw',
    duracaoMin: extrairMinutosDuracao(tempoConclusao),
    concluido: Boolean(aula.concluida),
    passos: aula.conteudo
      ? aula.conteudo.split('\n').filter(Boolean)
      : ['Siga as orientações práticas desta aula.'],
  };
}

/**
 * Mapeia a trilha e suas respectivas lições para o modelo de nó da UI (TrainingTrack).
 */
export function mapearTrilhaParaTrack(
  trilha: TrilhaApiResponse,
  licoes: TrainingLesson[],
  index: number
): TrainingTrack {
  const { categoria, icone } = resolveCategoriaEIcone(trilha.nome);
  const cor = trainingPalette[index % trainingPalette.length];

  return {
    id: String(trilha.id),
    categoria,
    titulo: trilha.nome,
    descricao: trilha.descricao,
    icone,
    cor,
    licoes,
  };
}
