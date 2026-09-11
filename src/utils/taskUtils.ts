import { TarefaResponse } from '../types/task';
import { formatarDataIsoYmd } from './streakUtils';

export interface MetricasTarefas {
  concluidas: TarefaResponse[];
  pendentes: TarefaResponse[];
  expiradas: TarefaResponse[];
  ativas: TarefaResponse[];
  total: number;
}

/**
 * Categoriza uma lista de tarefas por status em concluídas, pendentes, expiradas e ativas.
 */
export function categorizarTarefas(lista: TarefaResponse[]): MetricasTarefas {
  const concluidas: TarefaResponse[] = [];
  const pendentes: TarefaResponse[] = [];
  const expiradas: TarefaResponse[] = [];
  const ativas: TarefaResponse[] = [];

  for (const t of lista) {
    if (t.status === 'CONCLUIDO') concluidas.push(t);
    else if (t.status === 'PENDENTE') pendentes.push(t);
    else if (t.status === 'EXPIRADO') expiradas.push(t);

    if (t.status !== 'EXPIRADO') ativas.push(t);
  }

  return { concluidas, pendentes, expiradas, ativas, total: lista.length };
}

const PRIORIDADE_STATUS: Record<string, number> = {
  PENDENTE: 0,
  CONCLUIDO: 1,
  EXPIRADO: 2,
};

/**
 * Ordena tarefas da rotina priorizando pendentes (0), concluídas (1) e posicionando
 * as expiradas (2) automaticamente no final da fila. Tarefas com mesmo status são ordenadas por prazo.
 */
export function ordenarTarefasRotina(lista: TarefaResponse[]): TarefaResponse[] {
  return [...lista].sort((a, b) => {
    const pesoA = PRIORIDADE_STATUS[a.status] ?? 3;
    const pesoB = PRIORIDADE_STATUS[b.status] ?? 3;

    if (pesoA !== pesoB) {
      return pesoA - pesoB;
    }

    const tempoA = a.prazo ? new Date(a.prazo).getTime() : 0;
    const tempoB = b.prazo ? new Date(b.prazo).getTime() : 0;
    return tempoA - tempoB;
  });
}

/**
 * Filtra tarefas da rotina do dia (hoje) com base na data de prazo ou conclusão.
 */
export function filtrarTarefasHoje(lista: TarefaResponse[], hojeYmd: string | null | undefined): TarefaResponse[] {
  if (!hojeYmd) return [];
  return lista.filter((t) => {
    const dataPrazo = formatarDataIsoYmd(t.prazo);
    const dataConclusao = formatarDataIsoYmd(t.conclusao);
    return dataPrazo === hojeYmd || dataConclusao === hojeYmd;
  });
}

