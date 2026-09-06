import { TarefaResponse } from '../types/task';
import { DiaOfensiva } from '../types/models';

const DIAS_SEMANA_LABELS = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'] as const;

/**
 * Converte Date ou string ISO para string no formato YYYY-MM-DD no fuso local.
 */
export function formatarDataIsoYmd(data: Date | string | null | undefined): string | null {
  if (!data) return null;

  if (data instanceof Date) {
    if (isNaN(data.getTime())) return null;
    const ano = data.getFullYear();
    const mes = String(data.getMonth() + 1).padStart(2, '0');
    const dia = String(data.getDate()).padStart(2, '0');
    return `${ano}-${mes}-${dia}`;
  }

  const limpo = data.trim();
  if (!limpo) return null;

  if (/^\d{4}-\d{2}-\d{2}/.test(limpo)) {
    return limpo.slice(0, 10);
  }

  if (limpo.includes('/')) {
    const dataParte = limpo.split(' ')[0];
    const partes = dataParte.split('/');
    if (partes.length === 3) {
      const [dia, mes, ano] = partes;
      const anoFormatado = ano.length === 2 ? `20${ano}` : ano;
      return `${anoFormatado}-${mes.padStart(2, '0')}-${dia.padStart(2, '0')}`;
    }
  }

  const parsed = new Date(limpo);
  if (!isNaN(parsed.getTime())) {
    const ano = parsed.getFullYear();
    const mes = String(parsed.getMonth() + 1).padStart(2, '0');
    const dia = String(parsed.getDate()).padStart(2, '0');
    return `${ano}-${mes}-${dia}`;
  }

  return null;
}

/**
 * Agrupa tarefas por data (YYYY-MM-DD) considerando o prazo ou a data de conclusão.
 */
function adicionarTarefaNoMapa(mapa: Map<string, TarefaResponse[]>, chave: string | null, tarefa: TarefaResponse) {
  if (!chave) return;
  const lista = mapa.get(chave) || [];
  lista.push(tarefa);
  mapa.set(chave, lista);
}

function mapearTarefasPorData(tasks: TarefaResponse[]): Map<string, TarefaResponse[]> {
  const mapa = new Map<string, TarefaResponse[]>();

  for (const t of tasks) {
    const dataPrazo = formatarDataIsoYmd(t.prazo);
    adicionarTarefaNoMapa(mapa, dataPrazo, t);

    const dataConclusao = formatarDataIsoYmd(t.conclusao);
    if (dataConclusao && dataConclusao !== dataPrazo) {
      adicionarTarefaNoMapa(mapa, dataConclusao, t);
    }
  }

  return mapa;
}

/**
 * Calcula os 7 dias da semana atual (Segunda a Domingo) com o status real de conclusão.
 * Um dia é considerado concluído ('done') se houver pelo menos uma tarefa e 100% delas estiverem concluídas.
 */
export function calcularDiasSemanaAtual(
  tasks: TarefaResponse[],
  referenceDate: Date = new Date()
): DiaOfensiva[] {
  const mapaTarefas = mapearTarefasPorData(tasks);

  // Segunda-feira da semana atual
  const diaSemanaIndex = (referenceDate.getDay() + 6) % 7; // 0 = Seg, ..., 6 = Dom
  const segunda = new Date(referenceDate);
  segunda.setDate(referenceDate.getDate() - diaSemanaIndex);
  segunda.setHours(0, 0, 0, 0);

  return DIAS_SEMANA_LABELS.map((label, idx) => {
    const dataDia = new Date(segunda);
    dataDia.setDate(segunda.getDate() + idx);
    const dayNumber = String(dataDia.getDate());
    const isToday = idx === diaSemanaIndex;
    const isFuture = idx > diaSemanaIndex;

    const ymd = formatarDataIsoYmd(dataDia);
    const tarefasDoDia = ymd ? mapaTarefas.get(ymd) || [] : [];

    // Critério alinhado: 100% das tarefas concluídas (sem pendentes ou expiradas)
    // Se não tiver tarefas agendadas ou se for dia futuro, não marca como done
    const done = !isFuture && tarefasDoDia.length > 0 && tarefasDoDia.every((t) => t.status === 'CONCLUIDO');

    return {
      id: `dia_${idx}_${dayNumber}_${ymd || idx}`,
      dayLabel: label,
      dayNumber,
      done,
      isToday,
    };
  });
}

/**
 * Calcula o total de dias consecutivos de ofensiva (streak).
 * Regras alinhadas:
 * 1. Tarefas 100% concluídas no dia -> mantém e soma +1 dia à ofensiva.
 * 2. Tarefa pendente/expirada em dia passado -> quebra a ofensiva.
 * 3. Dias sem tarefas agendadas são neutros (não quebram a ofensiva).
 * 4. Interrompe a contagem quando não houver tarefas anteriores no histórico.
 */
export function calcularTotalOfensiva(
  tasks: TarefaResponse[],
  referenceDate: Date = new Date()
): number {
  if (tasks.length === 0) return 0;

  const mapaTarefas = mapearTarefasPorData(tasks);

  // Encontra a data mais antiga registrada para saber onde parar dias neutros
  const todasDatas = Array.from(mapaTarefas.keys()).sort();
  if (todasDatas.length === 0) return 0;
  const primeiraDataIso = todasDatas[0];

  let streak = 0;
  const cursor = new Date(referenceDate);
  cursor.setHours(0, 0, 0, 0);

  const hojeYmd = formatarDataIsoYmd(cursor);
  const tarefasHoje = hojeYmd ? mapaTarefas.get(hojeYmd) || [] : [];

  // Avaliação de hoje:
  if (tarefasHoje.length > 0) {
    const hojeConcluido = tarefasHoje.every((t) => t.status === 'CONCLUIDO');
    if (hojeConcluido) {
      streak += 1;
    }
  }

  // Percorre os dias anteriores de ontem para trás
  cursor.setDate(cursor.getDate() - 1);

  // Limite razoável de retrocesso (ex: até 365 dias)
  for (let i = 0; i < 365; i++) {
    const ymd = formatarDataIsoYmd(cursor);
    if (!ymd || ymd < primeiraDataIso) {
      break;
    }

    const tarefasDoDia = mapaTarefas.get(ymd) || [];

    if (tarefasDoDia.length > 0) {
      const allDone = tarefasDoDia.every((t) => t.status === 'CONCLUIDO');
      if (allDone) {
        streak += 1;
      } else {
        // Tarefas pendentes ou expiradas quebram a sequência
        break;
      }
    }
    // Dias sem tarefas são neutros (não incrementam nem quebram, continuam verificando dias anteriores)

    cursor.setDate(cursor.getDate() - 1);
  }

  return streak;
}
