import { useState, useCallback, useMemo } from 'react';
import { Alert } from 'react-native';
import { useSession } from './useSession';
import { usePets, usePetPontos } from './usePets';
import { useTasks, useCompleteTask, useDeleteTask } from './useTasks';
import { PetResponse } from '../types/pet';
import { TarefaResponse } from '../types/task';

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

  const {
    data: tasksData,
    isLoading: isLoadingTasks,
    isFetching: isFetchingTasks,
    isError: isErrorTasks,
    error: tasksError,
    refetch: refetchTasks,
  } = useTasks();

  const completeTaskMutation = useCompleteTask();
  const deleteTaskMutation = useDeleteTask();

  const pets: PetResponse[] = petsData?.content || [];
  const allTasks: TarefaResponse[] = tasksData?.content || [];

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
      if (!user) return;
      completeTaskMutation.mutate(
        {
          id: taskId,
          request: { concluinteId: user.id },
        },
        {
          onError: () => {
            Alert.alert('Aviso', 'Não foi possível atualizar o status da tarefa.');
          },
        }
      );
    },
    [user, completeTaskMutation]
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
              onError: () => {
                Alert.alert('Erro', 'Não foi possível excluir a tarefa.');
              },
            });
          },
        },
      ]);
    },
    [deleteTaskMutation]
  );

  const refetch = useCallback(async () => {
    await Promise.all([refetchPets(), refetchTasks(), refetchPontos()]);
  }, [refetchPets, refetchTasks, refetchPontos]);

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
    excluirTarefaComConfirmacao,
    isCompletingTask: completeTaskMutation.isPending,
    isDeletingTask: deleteTaskMutation.isPending,
  };
}
