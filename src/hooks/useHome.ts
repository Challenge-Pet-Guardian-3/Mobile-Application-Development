import { useMemo, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '../contexts/AuthContext';
import { usePets } from './usePets';
import { useFamily } from './useFamily';
import { useTarefas, CriarTarefaPayload, AtualizarTarefaPayload, TarefaBackend } from './useTarefas';
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

const formatarLabelDia = (dataIso: string, hojeIso: string, ontemIso: string): string => {
  if (dataIso === hojeIso) return 'Hoje';
  if (dataIso === ontemIso) return 'Ontem';
  const [, mes, dia] = dataIso.split('-');
  return `${dia}/${mes}`;
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
  const {
    tarefas,
    isLoading: loadingTarefas,
    criarTarefa,
    atualizarTarefa,
    alternarStatus,
    excluirTarefa,
    isCriando,
    isAtualizando,
  } = useTarefas();

  // XP individual: recalculado ao vivo direto das tarefas concluídas do usuário
  // (soma real via query no back), em vez de ler um contador acumulado que pode
  // dessincronizar (ex: tarefa concluída excluída sem devolver o XP).
  const { data: xpTotal = 0, isLoading: loadingXp } = useQuery({
    queryKey: ['pontos-usuario', userData?.id],
    queryFn: async () => {
      const { data } = await api.get<number>(`/tarefas/pontos/${userData?.id}`);
      return data;
    },
    enabled: Boolean(userData?.id),
  });

  const loading = loadingPets || loadingTarefas || loadingFamilia || loadingXp;
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

  // Todas as tarefas não expiradas, agrupadas por dia (mais recente primeiro).
  const tarefasPorDia = useMemo((): GrupoTarefasPorDia[] => {
    const grupos = new Map<string, TarefaBackend[]>();

    tarefas.forEach((t) => {
      if (t.expirada) return;
      const dataIso = extrairDataIso(t.prazo);
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
    tarefasExpiradas,
    todasTarefas: tarefas,
    historicoConcluidas,
    diasOfensiva,
    handleCriarTarefa,
    handleAtualizarTarefa,
    alternarTarefaStatus,
    handleExcluirTarefa,
    proximaTarefaPendente,
    criandoTarefa: isCriando || isAtualizando,
  };
}