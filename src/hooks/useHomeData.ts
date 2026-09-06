import { useState, useCallback, useMemo } from 'react';
import { Alert } from 'react-native';
import { useSession } from './useSession';
import { usePets, usePetPontos } from './usePets';
import { useUserTasks, useTasks, useCompleteTask, useUncompleteTask, useUpdateTask, useDeleteTask } from './useTasks';
import { PetResponse } from '../types/pet';
import { TarefaResponse } from '../types/task';
import { TaskFormData } from '../components/TaskFormModal';
import { TaskSchema, formatZodError } from '../utils/schemas';
import { getApiErrorMessage } from '../utils/apiError';
import { normalizarPrazoParaIso } from '../utils/petUtils';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../routes/types';
import { calcularDiasSemanaAtual, calcularTotalOfensiva, formatarDataIsoYmd } from '../utils/streakUtils';

function categorizarTarefas(lista: TarefaResponse[]) {
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

export function useHomeData(navigation?: NativeStackNavigationProp<RootStackParamList>) {
  const { user } = useSession();

  const [selectedPetId, setSelectedPetId] = useState<number | null>(null);

  const {
    data: petsData,
    isLoading: isLoadingPets,
    isFetching: isFetchingPets,
    isError: isErrorPets,
    error: petsError,
    refetch: refetchPets,
  } = usePets();

  // Busca tarefas vinculadas aos pets do usuário com status completo
  const {
    data: userTasksData,
    isLoading: isLoadingUserTasks,
    isFetching: isFetchingUserTasks,
    isError: isErrorUserTasks,
    error: userTasksError,
    refetch: refetchUserTasks,
  } = useUserTasks(user?.id, 0, 100, 'ALL');

  // Fallback para useTasks global caso user não esteja logado
  const {
    data: globalTasksData,
    isLoading: isLoadingGlobalTasks,
    isFetching: isFetchingGlobalTasks,
    refetch: refetchGlobalTasks,
  } = useTasks(0, 100);

  const isLoadingTasks = user?.id ? isLoadingUserTasks : isLoadingGlobalTasks;
  const isFetchingTasks = user?.id ? isFetchingUserTasks : isFetchingGlobalTasks;
  const isErrorTasks = user?.id ? isErrorUserTasks : false;
  const tasksError = user?.id ? userTasksError : null;

  const completeTaskMutation = useCompleteTask();
  const uncompleteTaskMutation = useUncompleteTask();
  const updateTaskMutation = useUpdateTask();
  const deleteTaskMutation = useDeleteTask();

  const pets: PetResponse[] = petsData?.content || [];
  const allTasks: TarefaResponse[] = user?.id
    ? userTasksData?.content || []
    : globalTasksData?.content || [];

  const activePet: PetResponse | undefined = useMemo(() => {
    if (pets.length === 0) return undefined;
    if (selectedPetId !== null) {
      const found = pets.find((p) => p.id === selectedPetId);
      if (found) return found;
    }
    return pets[0];
  }, [pets, selectedPetId]);

  const { data: pontosPetData, refetch: refetchPontos } = usePetPontos(activePet?.id);

  const tarefasDoPet = useMemo(() => {
    if (!activePet) return [];
    return allTasks.filter((t) => t.petId === activePet.id);
  }, [allTasks, activePet]);

  const metricasPet = useMemo(() => categorizarTarefas(tarefasDoPet), [tarefasDoPet]);

  const hojeYmd = useMemo(() => formatarDataIsoYmd(new Date()), []);

  // Tarefas da rotina do dia (hoje) para o pet ativo
  const tarefasDoPetHoje = useMemo(() => {
    if (!activePet || !hojeYmd) return [];
    return tarefasDoPet.filter((t) => {
      const dataPrazo = formatarDataIsoYmd(t.prazo);
      const dataConclusao = formatarDataIsoYmd(t.conclusao);
      return dataPrazo === hojeYmd || dataConclusao === hojeYmd;
    });
  }, [tarefasDoPet, activePet, hojeYmd]);

  const metricasPetHoje = useMemo(() => categorizarTarefas(tarefasDoPetHoje), [tarefasDoPetHoje]);

  const petScore = useMemo(() => {
    if (pontosPetData?.pontosTotais !== undefined) {
      return pontosPetData.pontosTotais;
    }
    return metricasPet.concluidas.reduce((acc, t) => acc + (t.pontosTarefa ?? 0), 0);
  }, [pontosPetData, metricasPet.concluidas]);

  const ofensivaFamiliar = useMemo(() => {
    return {
      streakDays: calcularDiasSemanaAtual(allTasks),
      totalStreak: calcularTotalOfensiva(allTasks),
    };
  }, [allTasks]);

  const alternarStatusTarefa = useCallback(
    (taskId: number) => {
      if (!user) {
        Alert.alert('Sessão expirada', 'Faça login novamente para atualizar tarefas.');
        return;
      }

      const tarefa = tarefasDoPet.find((t) => t.id === taskId);
      if (!tarefa) return;

      if (tarefa.status === 'CONCLUIDO') {
        uncompleteTaskMutation.mutate(
          { id: taskId, usuarioId: user.id },
          {
            onError: (err) => {
              Alert.alert('Erro ao Desmarcar', getApiErrorMessage(err, 'Não foi possível desmarcar a tarefa.'));
            },
          }
        );
      } else if (tarefa.status === 'EXPIRADO') {
        Alert.alert(
          'Tarefa Expirada',
          'Esta tarefa já expirou e não pode ser concluída diretamente. Para reativá-la como pendente, clique no lápis de edição e defina uma nova data e horário futuro.',
          [{ text: 'Entendi' }]
        );
      } else {
        completeTaskMutation.mutate(
          {
            id: taskId,
            request: { concluinteId: user.id },
          },
          {
            onError: (err) => {
              Alert.alert('Erro ao Concluir', getApiErrorMessage(err, 'Não foi possível concluir a tarefa.'));
            },
          }
        );
      }
    },
    [user, tarefasDoPet, completeTaskMutation, uncompleteTaskMutation]
  );

  const excluirTarefaComConfirmacao = useCallback(
    (taskId: number) => {
      Alert.alert('Remover Tarefa', 'Deseja realmente remover esta rotina do pet?', [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Excluir',
          style: 'destructive',
          onPress: () => {
            deleteTaskMutation.mutate(taskId, {
              onError: (err) => {
                Alert.alert('Erro ao Excluir', getApiErrorMessage(err, 'Não foi possível excluir a tarefa.'));
              },
            });
          },
        },
      ]);
    },
    [deleteTaskMutation]
  );

  const atualizarTarefa = useCallback(
    (taskId: number, data: TaskFormData, callbacks?: { onSuccess?: () => void; onError?: (err: unknown) => void }) => {
      if (!user) {
        Alert.alert('Sessão expirada', 'Faça login novamente para atualizar uma tarefa.');
        return;
      }

      const validacao = TaskSchema.safeParse(data);
      if (!validacao.success) {
        Alert.alert('Dados da Tarefa', formatZodError(validacao.error));
        return;
      }

      const statusFinal = data.status || 'PENDENTE';
      const prazoIso = normalizarPrazoParaIso(data.prazo);
      const conclusaoIso =
        statusFinal === 'CONCLUIDO'
          ? (data.conclusao ? normalizarPrazoParaIso(data.conclusao, '12:00:00') : new Date().toISOString().slice(0, 19))
          : null;

      updateTaskMutation.mutate(
        {
          id: taskId,
          data: {
            titulo: data.titulo.trim(),
            descricao: data.descricao.trim(),
            pontosTarefa: Number(data.pontos),
            prazo: prazoIso,
            usuarioId: user.id,
            petId: data.petId,
            status: statusFinal,
            conclusao: conclusaoIso,
          },
        },
        {
          onSuccess: () => {
            callbacks?.onSuccess?.();
          },
          onError: (err) => {
            Alert.alert('Erro ao Atualizar', getApiErrorMessage(err, 'Não foi possível atualizar a tarefa.'));
            callbacks?.onError?.(err);
          },
        }
      );
    },
    [user, updateTaskMutation]
  );

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
  const [tarefaEmEdicao, setTarefaEmEdicao] = useState<TarefaResponse | null>(null);

  const handleToggleTarefa = useCallback(
    (taskId: number) => {
      const tarefa = tarefasDoPet.find((t) => t.id === taskId);
      if (tarefa?.status === 'EXPIRADO') {
        Alert.alert(
          'Tarefa Expirada',
          'Esta tarefa expirou e não pode ser concluída diretamente. Deseja definir um novo horário futuro para reativá-la?',
          [
            { text: 'Cancelar', style: 'cancel' },
            {
              text: 'Editar Tarefa',
              onPress: () => setTarefaEmEdicao(tarefa),
            },
          ]
        );
        return;
      }
      alternarStatusTarefa(taskId);
    },
    [tarefasDoPet, alternarStatusTarefa]
  );

  const initialTaskData = useMemo(() => {
    if (!tarefaEmEdicao) return null;
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
    return {
      tarefas: isHoje ? tarefasDoPetHoje : tarefasDoPet,
      concluidas: isHoje ? metricasPetHoje.concluidas.length : metricasPet.concluidas.length,
      ativas: isHoje ? metricasPetHoje.ativas.length : metricasPet.ativas.length,
      expiradas: isHoje ? metricasPetHoje.expiradas.length : metricasPet.expiradas.length,
    };
  }, [
    filtroRotina,
    tarefasDoPetHoje,
    tarefasDoPet,
    metricasPetHoje.concluidas.length,
    metricasPet.concluidas.length,
    metricasPetHoje.ativas.length,
    metricasPet.ativas.length,
    metricasPetHoje.expiradas.length,
    metricasPet.expiradas.length,
  ]);

  const handleCloseEditModal = useCallback(() => {
    setTarefaEmEdicao(null);
  }, []);

  const handleSubmitEditModal = useCallback(
    (data: TaskFormData) => {
      if (tarefaEmEdicao) {
        atualizarTarefa(tarefaEmEdicao.id, data, {
          onSuccess: handleCloseEditModal,
        });
      }
    },
    [tarefaEmEdicao, atualizarTarefa, handleCloseEditModal]
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
      select: setSelectedPetId,
    },
    routine: {
      current: rotinaAtual,
      filter: filtroRotina,
      setFilter: setFiltroRotina,
      score: petScore,
      streak: ofensivaFamiliar,
      allPetTasks: tarefasDoPet,
      todayTasks: tarefasDoPetHoje,
      completedToday: metricasPetHoje.concluidas,
      activeToday: metricasPetHoje.ativas,
      toggleTask: handleToggleTarefa,
    },
    taskModal: {
      editingTask: tarefaEmEdicao,
      initialData: initialTaskData,
      isUpdating: updateTaskMutation.isPending,
      openEdit: setTarefaEmEdicao,
      close: handleCloseEditModal,
      submit: handleSubmitEditModal,
      remove: excluirTarefaComConfirmacao,
    },
    navigation: {
      toFamily: handleNavigateToFamily,
      toPetDetail: handleNavigateToPetDetail,
      toAi: handleNavigateToAi,
    },
  };
}
