import { TarefaResponse } from '../types/task';
import { formatarDataIsoYmd } from './streakUtils';

export interface MetricasTarefas {
  concluidas: TarefaResponse[];
  pendentes: TarefaResponse[];
  expiradas: TarefaResponse[];
  ativas: TarefaResponse[];
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

  return { concluidas, pendentes, expiradas, ativas };
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
