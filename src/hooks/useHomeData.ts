import { useState, useCallback, useMemo } from 'react';
import { Alert } from 'react-native';
import { useSession } from './useSession';
import { usePets, usePetPontos } from './usePets';
import { useUserTasks, useTasks } from './useTasks';
import { useActivePet } from './useActivePet';
import { useTaskActions } from './useTaskActions';
import { PetResponse } from '../types/pet';
import { TarefaResponse, TaskFormData } from '../types/task';
import { categorizarTarefas, filtrarTarefasHoje, ordenarTarefasRotina } from '../utils/taskUtils';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../routes/types';
import { calcularDiasSemanaAtual, calcularTotalOfensiva, formatarDataIsoYmd } from '../utils/streakUtils';

export function useHomeData(navigation?: NativeStackNavigationProp<RootStackParamList>) {
  const { user } = useSession();
  const taskActions = useTaskActions();

  const {
    data: petsData,
    isLoading: isLoadingPets,
    isFetching: isFetchingPets,
    isError: isErrorPets,
    error: petsError,
    refetch: refetchPets,
  } = usePets();

  const pets: PetResponse[] = petsData?.content || [];
  const { activePet, selectedPetId, selectPet } = useActivePet(pets);

  // Busca tarefas vinculadas aos pets do usuário com status completo
  const {
    data: userTasksData,
    isLoading: isLoadingUserTasks,
    isFetching: isFetchingUserTasks,
    isError: isErrorUserTasks,
    error: userTasksError,
    refetch: refetchUserTasks,
  } = useUserTasks(user?.id, 0, 100, 'ALL');

  // Fallback para useTasks global apenas caso user não esteja logado
  const {
    data: globalTasksData,
    isLoading: isLoadingGlobalTasks,
    isFetching: isFetchingGlobalTasks,
    refetch: refetchGlobalTasks,
  } = useTasks(0, 100, !user?.id);

  const isLoadingTasks = user?.id ? isLoadingUserTasks : isLoadingGlobalTasks;
  const isFetchingTasks = user?.id ? isFetchingUserTasks : isFetchingGlobalTasks;
  const isErrorTasks = user?.id ? isErrorUserTasks : false;
  const tasksError = user?.id ? userTasksError : null;

  const allTasks: TarefaResponse[] = user?.id
    ? userTasksData?.content || []
    : globalTasksData?.content || [];

  const { data: pontosPetData, refetch: refetchPontos } = usePetPontos(activePet?.id);

  const tarefasDoPet = useMemo(() => {
    if (!activePet) return [];
    return allTasks.filter((t) => t.petId === activePet.id);
  }, [allTasks, activePet]);

  const metricasPet = useMemo(() => categorizarTarefas(tarefasDoPet), [tarefasDoPet]);

  const hojeYmd = useMemo(() => formatarDataIsoYmd(new Date()), []);

  // Tarefas da rotina do dia (hoje) para o pet ativo, com ordenação prioritária (expiradas ao final)
  const tarefasDoPetHoje = useMemo(() => {
    if (!activePet) return [];
    return ordenarTarefasRotina(filtrarTarefasHoje(tarefasDoPet, hojeYmd));
  }, [tarefasDoPet, activePet, hojeYmd]);

  const metricasPetHoje = useMemo(() => categorizarTarefas(tarefasDoPetHoje), [tarefasDoPetHoje]);

  const petScore = useMemo(() => {
    if (pontosPetData?.pontosTotais !== undefined) {
      return pontosPetData.pontosTotais;
    }
    return metricasPet.concluidas.reduce((acc, t) => acc + t.pontosTarefa, 0);
  }, [pontosPetData, metricasPet.concluidas]);

  const ofensivaFamiliar = useMemo(() => {
    return {
      streakDays: calcularDiasSemanaAtual(allTasks),
      totalStreak: calcularTotalOfensiva(allTasks),
    };
  }, [allTasks]);

  const refetch = useCallback(async () => {
    await Promise.all([
      refetchPets(),
      user?.id ? refetchUserTasks() : refetchGlobalTasks(),
      refetchPontos(),
    ]);
  }, [refetchPets, user?.id, refetchUserTasks, refetchGlobalTasks, refetchPontos]);

  // Controle de Visualização da Rotina (Hoje vs Todas)
  const [filtroRotina, setFiltroRotina] = useState<'HOJE' | 'TODAS'>('HOJE');

  // Controle de Modal de Edição de Tarefas
  const [tarefaEmEdicao, setTarefaEmEdicao] = useState<TarefaResponse | undefined>(undefined);

  const handleToggleTarefa = useCallback(
    (taskId: number) => {
      taskActions.alternarStatus(taskId, tarefasDoPet, {
        onEdit: setTarefaEmEdicao,
      });
    },
    [taskActions, tarefasDoPet]
  );

  const initialTaskData = useMemo(() => {
    if (!tarefaEmEdicao) return undefined;
    return {
      petId: tarefaEmEdicao.petId,
      titulo: tarefaEmEdicao.titulo,
      descricao: tarefaEmEdicao.descricao,
      pontos: String(tarefaEmEdicao.pontosTarefa),
      prazo: tarefaEmEdicao.prazo,
      status: tarefaEmEdicao.status,
      conclusao: tarefaEmEdicao.conclusao,
    };
  }, [tarefaEmEdicao]);

  const rotinaAtual = useMemo(() => {
    const isHoje = filtroRotina === 'HOJE';
    const tarefasFiltradas = isHoje ? tarefasDoPetHoje : ordenarTarefasRotina(tarefasDoPet);
    const m = isHoje ? metricasPetHoje : metricasPet;
    const c = m.concluidas.length;
    const e = m.expiradas.length;
    const total = tarefasFiltradas.length;

    return {
      tarefas: tarefasFiltradas,
      concluidas: c,
      ativas: m.ativas.length,
      expiradas: e,
      total,
      title: isHoje ? 'Rotina de Hoje' : 'Todas as Tarefas',
      subtitle: `${c} de ${total} concluídas ${isHoje ? 'hoje' : 'no total'}${e > 0 ? ` • ${e} expirada${e > 1 ? 's' : ''}` : ''}`,
      emptyTitle: isHoje ? 'Nenhuma tarefa agendada para hoje' : 'Nenhuma tarefa cadastrada',
      emptyDesc: isHoje
        ? 'Crie novas tarefas para seu pet na aba Family Pet.'
        : 'Crie novas tarefas para seu pet na aba Family Pet.',
    };
  }, [filtroRotina, tarefasDoPetHoje, tarefasDoPet, metricasPetHoje, metricasPet]);

  const sectionData = useMemo(() => ({
    title: rotinaAtual.title,
    subtitle: rotinaAtual.subtitle,
    filter: filtroRotina,
    onFilterChange: setFiltroRotina,
    countHoje: tarefasDoPetHoje.length,
    countTodas: tarefasDoPet.length,
    tasks: rotinaAtual.tarefas,
    onToggleTask: handleToggleTarefa,
    onEditTask: setTarefaEmEdicao,
    onDeleteTask: taskActions.excluirComConfirmacao,
  }), [
    rotinaAtual.title,
    rotinaAtual.subtitle,
    rotinaAtual.tarefas,
    filtroRotina,
    setFiltroRotina,
    tarefasDoPetHoje.length,
    tarefasDoPet.length,
    handleToggleTarefa,
    taskActions.excluirComConfirmacao,
  ]);

  const handleCloseEditModal = useCallback(() => {
    setTarefaEmEdicao(undefined);
  }, []);

  const handleSubmitEditModal = useCallback(
    (data: TaskFormData) => {
      if (tarefaEmEdicao) {
        taskActions.atualizar(tarefaEmEdicao.id, data, {
          onSuccess: handleCloseEditModal,
        });
      }
    },
    [tarefaEmEdicao, taskActions, handleCloseEditModal]
  );

  // Handlers de Navegação
  const handleNavigateToFamily = useCallback(() => {
    navigation?.navigate('Family');
  }, [navigation]);

  const handleNavigateToPetDetail = useCallback(() => {
    navigation?.navigate('Family', { screen: 'PetDetail', params: { petId: activePet?.id } });
  }, [navigation, activePet]);

  const handleNavigateToAi = useCallback(() => {
    navigation?.navigate('IA');
  }, [navigation]);

  return {
    status: {
      isLoading: isLoadingPets,
      isLoadingTasks,
      isFetching: isFetchingPets || isFetchingTasks,
      isError: isErrorPets || isErrorTasks,
      error: petsError || tasksError,
      refetch,
    },
    pets: {
      list: pets,
      active: activePet,
      selectedId: selectedPetId,
      select: selectPet,
    },
    routine: {
      sectionData,
      current: rotinaAtual,
      filter: filtroRotina,
      setFilter: setFiltroRotina,
      score: petScore,
      streak: ofensivaFamiliar,
      allPetTasks: tarefasDoPet,
      todayTasks: tarefasDoPetHoje,
      completedToday: metricasPetHoje.concluidas,
      activeToday: metricasPetHoje.ativas,
      expiredToday: metricasPetHoje.expiradas,
      metricsToday: metricasPetHoje,
      toggleTask: handleToggleTarefa,
    },
    taskModal: {
      editingTask: tarefaEmEdicao,
      initialData: initialTaskData,
      isUpdating: taskActions.isUpdating,
      openEdit: setTarefaEmEdicao,
      close: handleCloseEditModal,
      submit: handleSubmitEditModal,
      remove: taskActions.excluirComConfirmacao,
    },
    navigation: {
      toFamily: handleNavigateToFamily,
      toPetDetail: handleNavigateToPetDetail,
      toAi: handleNavigateToAi,
    },
  };
}
