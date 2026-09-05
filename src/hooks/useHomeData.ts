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

export function useHomeData() {
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

  const tarefasConcluidas = useMemo(
    () => tarefasDoPet.filter((t) => t.status === 'CONCLUIDO'),
    [tarefasDoPet]
  );
  const tarefasPendentes = useMemo(
    () => tarefasDoPet.filter((t) => t.status !== 'CONCLUIDO'),
    [tarefasDoPet]
  );
  const petScore = useMemo(() => {
    if (pontosPetData?.pontosTotais !== undefined) {
      return pontosPetData.pontosTotais;
    }
    return tarefasConcluidas.reduce((acc, t) => acc + (t.pontosTarefa ?? 0), 0);
  }, [pontosPetData, tarefasConcluidas]);

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

      const prazoData = new Date();
      prazoData.setHours(23, 59, 0, 0);

      updateTaskMutation.mutate(
        {
          id: taskId,
          data: {
            titulo: data.titulo.trim(),
            descricao: data.descricao.trim(),
            pontosTarefa: Number(data.pontos),
            prazo: prazoData.toISOString().slice(0, 19),
            usuarioId: user.id,
            petId: data.petId,
            status: 'PENDENTE',
          },
        },
        {
          onSuccess: () => {
            Alert.alert('Sucesso!', 'Tarefa atualizada com sucesso!');
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

  return {
    user,
    pets,
    isLoadingPets,
    isLoadingTasks,
    isFetching: isFetchingPets || isFetchingTasks,
    isError: isErrorPets || isErrorTasks,
    error: petsError || tasksError,
    refetch,
    selectedPetId,
    setSelectedPetId,
    activePet,
    allTasks,
    tarefasDoPet,
    tarefasConcluidas,
    tarefasPendentes,
    petScore,
    alternarStatusTarefa,
    atualizarTarefa,
    excluirTarefaComConfirmacao,
    isCompletingTask: completeTaskMutation.isPending,
    isUncompletingTask: uncompleteTaskMutation.isPending,
    isUpdatingTask: updateTaskMutation.isPending,
    isDeletingTask: deleteTaskMutation.isPending,
  };
}
