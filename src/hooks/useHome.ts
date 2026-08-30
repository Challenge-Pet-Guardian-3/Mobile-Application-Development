import { useMemo, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '../contexts/AuthContext';
import { usePets } from './usePets';
import { useFamily } from './useFamily';
import { useTrilhas } from './useTrilhas';
import {
  useTarefas,
  CriarTarefaPayload,
  CriarTarefaRecorrentePayload,
  AtualizarTarefaPayload,
  TarefaBackend,
} from './useTarefas';
import { api } from '../services/api';

export interface DiaOfensiva {
  dia: string;
  numero: number;
  dataIso: string;
  ativo: boolean;
  isHoje: boolean;
}

export interface GrupoTarefasPorDia {
  dataIso: string;
  label: string;
  tarefas: TarefaBackend[];
}

const DIAS_SEMANA_ABREV = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

const getHojeIso = (): string => {
  const agora = new Date();
  const ano = agora.getFullYear();
  const mes = String(agora.getMonth() + 1).padStart(2, '0');
  const dia = String(agora.getDate()).padStart(2, '0');
  return `${ano}-${mes}-${dia}`;
};

const getOntemIso = (): string => {
  const agora = new Date();
  agora.setDate(agora.getDate() - 1);
  const ano = agora.getFullYear();
  const mes = String(agora.getMonth() + 1).padStart(2, '0');
  const dia = String(agora.getDate()).padStart(2, '0');
  return `${ano}-${mes}-${dia}`;
};

const extrairDataIso = (dataString?: string | null): string => {
  if (!dataString) return getHojeIso();
  return dataString.split('T')[0];
};

// Constrói a data em horário local (evita o "voltar 1 dia" causado por fuso na
// conversão direta de string ISO pura para Date).
const dataIsoParaDate = (dataIso: string): Date => {
  const [ano, mes, dia] = dataIso.split('-').map(Number);
  return new Date(ano, mes - 1, dia);
};

const formatarLabelDia = (dataIso: string, hojeIso: string, ontemIso: string): string => {
  if (dataIso === hojeIso) return 'Hoje';
  if (dataIso === ontemIso) return 'Ontem';
  const [, mes, dia] = dataIso.split('-');
  const diaSemana = DIAS_SEMANA_ABREV[dataIsoParaDate(dataIso).getDay()];
  return `${diaSemana}, ${dia}/${mes}`;
};

const calcularDiasSemana = (tarefas: TarefaBackend[]): DiaOfensiva[] => {
  const agora = new Date();
  const diaDaSemana = agora.getDay();
  const diffSegunda = diaDaSemana === 0 ? -6 : 1 - diaDaSemana;

  const segundaFeira = new Date(agora);
  segundaFeira.setDate(agora.getDate() + diffSegunda);
  segundaFeira.setHours(0, 0, 0, 0);

  const hojeIso = getHojeIso();
  const siglas = ['S', 'T', 'Q', 'Q', 'S', 'S', 'D'];

  const datasComTarefasConcluidas = new Set<string>();
  tarefas.forEach((t) => {
    if (t.concluida || t.status === 'CONCLUIDO') {
      const dataIso = extrairDataIso(t.prazo);
      datasComTarefasConcluidas.add(dataIso);
    }
  });

  const diasSemana: DiaOfensiva[] = [];
  for (let i = 0; i < 7; i++) {
    const dataDia = new Date(segundaFeira);
    dataDia.setDate(segundaFeira.getDate() + i);

    const ano = dataDia.getFullYear();
    const mes = String(dataDia.getMonth() + 1).padStart(2, '0');
    const dia = String(dataDia.getDate()).padStart(2, '0');
    const dataIso = `${ano}-${mes}-${dia}`;

    diasSemana.push({
      dia: siglas[i],
      numero: dataDia.getDate(),
      dataIso,
      ativo: datasComTarefasConcluidas.has(dataIso),
      isHoje: dataIso === hojeIso,
    });
  }

  return diasSemana;
};

export function useHome() {
  const { userData } = useAuth();
  const { pets, isLoading: loadingPets } = usePets();
  const { familia, isLoading: loadingFamilia } = useFamily();
  const { xpTrilhas, isLoading: loadingTrilhas } = useTrilhas();
  const {
    tarefas,
    isLoading: loadingTarefas,
    criarTarefa,
    criarTarefaRecorrente,
    atualizarTarefa,
    alternarStatus,
    excluirTarefa,
    isCriando,
    isCriandoRecorrente,
    isAtualizando,
  } = useTarefas();

  // XP de tarefas: recalculado ao vivo direto das tarefas concluídas do usuário
  // (soma real via query no back), em vez de ler um contador acumulado que pode
  // dessincronizar (ex: tarefa concluída excluída sem devolver o XP).
  const { data: pontosTarefas = 0, isLoading: loadingXp } = useQuery({
    queryKey: ['pontos-usuario', userData?.id],
    queryFn: async () => {
      const { data } = await api.get<number>(`/tarefas/pontos/${userData?.id}`);
      return data;
    },
    enabled: Boolean(userData?.id),
  });

  // XP total real do usuário: tarefas + trilhas. Independe de ter família ou não.
  const xpTotal = pontosTarefas + xpTrilhas;

  const loading = loadingPets || loadingTarefas || loadingFamilia || loadingXp || loadingTrilhas;
  const temFamilia = familia.ativa;
  const householdName = familia.nome || (userData?.nome ? `Família de ${userData.nome}` : 'Família PetGuardian');
  const hojeIso = getHojeIso();
  const ontemIso = getOntemIso();

  const diasOfensiva = useMemo(() => {
    return calcularDiasSemana(tarefas);
  }, [tarefas]);

  const ofensivaTotal = useMemo(() => {
    return diasOfensiva.filter((d) => d.ativo).length;
  }, [diasOfensiva]);

  // Mantido pra alimentar o HighlightTaskCard e o contador rápido: pendentes
  // (não expiradas) + concluídas hoje ou ontem.
  const tarefasDeHoje = useMemo(() => {
    return tarefas.filter((t) => {
      if (t.expirada) return false;
      if (!t.concluida) return true;
      const dataIso = extrairDataIso(t.prazo);
      return dataIso === hojeIso || dataIso === ontemIso;
    });
  }, [tarefas, hojeIso, ontemIso]);

  // Tarefas de hoje pra trás, agrupadas por dia (mais recente primeiro).
  // Tarefas futuras (recorrências ainda não vencidas) NÃO entram aqui —
  // vão para tarefasProximas, exibidas de forma recolhida na tela.
  const tarefasPorDia = useMemo((): GrupoTarefasPorDia[] => {
    const grupos = new Map<string, TarefaBackend[]>();

    tarefas.forEach((t) => {
      if (t.expirada) return;
      const dataIso = extrairDataIso(t.prazo);
      if (dataIso > hojeIso) return; // futura: não entra na lista principal
      if (!grupos.has(dataIso)) grupos.set(dataIso, []);
      grupos.get(dataIso)!.push(t);
    });

    const diasOrdenados = Array.from(grupos.keys()).sort((a, b) => b.localeCompare(a));

    return diasOrdenados.map((dataIso) => ({
      dataIso,
      label: formatarLabelDia(dataIso, hojeIso, ontemIso),
      tarefas: grupos.get(dataIso)!.sort((a, b) => (b.id || 0) - (a.id || 0)),
    }));
  }, [tarefas, hojeIso, ontemIso]);

  // Tarefas com prazo futuro (dia seguinte em diante) — normalmente ocorrências
  // de uma tarefa recorrente ainda não vencidas. Ordenadas da mais próxima
  // para a mais distante.
  const tarefasProximas = useMemo((): GrupoTarefasPorDia[] => {
    const grupos = new Map<string, TarefaBackend[]>();

    tarefas.forEach((t) => {
      if (t.expirada || t.concluida) return;
      const dataIso = extrairDataIso(t.prazo);
      if (dataIso <= hojeIso) return;
      if (!grupos.has(dataIso)) grupos.set(dataIso, []);
      grupos.get(dataIso)!.push(t);
    });

    const diasOrdenados = Array.from(grupos.keys()).sort((a, b) => a.localeCompare(b));

    return diasOrdenados.map((dataIso) => ({
      dataIso,
      label: formatarLabelDia(dataIso, hojeIso, ontemIso),
      tarefas: grupos.get(dataIso)!.sort((a, b) => (a.id || 0) - (b.id || 0)),
    }));
  }, [tarefas, hojeIso, ontemIso]);

  const totalTarefasProximas = useMemo(() => {
    return tarefasProximas.reduce((acc, grupo) => acc + grupo.tarefas.length, 0);
  }, [tarefasProximas]);

  const tarefasExpiradas = useMemo(() => {
    return tarefas.filter((t) => t.expirada);
  }, [tarefas]);

  const historicoConcluidas = useMemo(() => {
    return tarefas
      .filter((t) => t.concluida || t.status === 'CONCLUIDO')
      .sort((a, b) => (b.id || 0) - (a.id || 0));
  }, [tarefas]);

  const proximaTarefaPendente = useMemo(() => {
    return tarefasDeHoje.find((t) => !t.concluida && t.status !== 'CONCLUIDO') || null;
  }, [tarefasDeHoje]);

  const handleCriarTarefa = useCallback(
    async (titulo: string, descricao: string, petId: number) => {
      const payload: CriarTarefaPayload = {
        titulo,
        descricao,
        petId,
        pontosTarefa: 15,
      };
      return await criarTarefa(payload);
    },
    [criarTarefa]
  );

  const handleCriarTarefaRecorrente = useCallback(
    async (
      titulo: string,
      descricao: string,
      petId: number,
      diasSemana: string[],
      horario: string,
      dataFim: string
    ) => {
      const payload: CriarTarefaRecorrentePayload = {
        titulo,
        descricao,
        petId,
        pontosTarefa: 15,
        diasSemana,
        horario,
        dataFim,
      };
      return await criarTarefaRecorrente(payload);
    },
    [criarTarefaRecorrente]
  );

  const handleAtualizarTarefa = useCallback(
    async (id: number, titulo: string, descricao: string, petId: number, status?: string) => {
      const payload: AtualizarTarefaPayload = {
        id,
        titulo,
        descricao,
        petId,
        pontosTarefa: 15,
        status: status || 'PENDENTE',
      };
      return await atualizarTarefa(payload);
    },
    [atualizarTarefa]
  );

  const alternarTarefaStatus = useCallback(
    async (id: number) => {
      const tarefa = tarefas.find((t) => t.id === id);
      if (tarefa?.expirada) return;
      const concluida = Boolean(tarefa?.concluida || tarefa?.status === 'CONCLUIDO');
      await alternarStatus({ id, concluida });
    },
    [tarefas, alternarStatus]
  );

  const handleExcluirTarefa = useCallback(
    async (id: number) => {
      await excluirTarefa(id);
    },
    [excluirTarefa]
  );

  return {
    loading,
    temFamilia,
    xpTotal,
    ofensivaTotal,
    householdName,
    petsDaFamilia: pets,
    tarefas: tarefasDeHoje,
    tarefasPorDia,
    tarefasProximas,
    totalTarefasProximas,
    tarefasExpiradas,
    todasTarefas: tarefas,
    historicoConcluidas,
    diasOfensiva,
    handleCriarTarefa,
    handleCriarTarefaRecorrente,
    handleAtualizarTarefa,
    alternarTarefaStatus,
    handleExcluirTarefa,
    proximaTarefaPendente,
    criandoTarefa: isCriando || isAtualizando || isCriandoRecorrente,
  };
}