import { useCallback } from 'react';
import { Alert } from 'react-native';
import { useSession } from './useSession';
import { usePets, useCreatePet, useInviteCaregiver } from './usePets';
import { useTasks, useCreateTask, useDeleteTask } from './useTasks';
import { useRedeCuidado } from './useRedeCuidado';
import { normalizarDataNascParaIso } from '../utils/petUtils';
import { PetFormData } from '../components/PetFormModal';
import { TaskFormData } from '../components/TaskFormModal';
import { InviteCaregiverData } from '../components/InviteCaregiverModal';
import { PetResponse } from '../types/pet';
import { TarefaResponse } from '../types/task';
import { RedeCuidadoResponse } from '../types/user';
import { PetSchema, TaskSchema, InviteCaregiverSchema, formatZodError } from '../utils/schemas';

export interface ActionCallbacks {
  onSuccess?: () => void;
  onError?: (error: unknown) => void;
}

export function useFamilyCare() {
  const { user } = useSession();

  // Queries de dados da família e dos pets
  const { data: petsData, isLoading: isLoadingPets, isFetching: isFetchingPets, refetch: refetchPets } = usePets();
  const { data: tasksData, isLoading: isLoadingTasks, isFetching: isFetchingTasks, refetch: refetchTasks } = useTasks();
  const { data: redeCuidadoData, isLoading: isLoadingRede, isFetching: isFetchingRede, refetch: refetchRede } = useRedeCuidado(user?.id);

  // Mutations
  const createPetMutation = useCreatePet();
  const createTaskMutation = useCreateTask();
  const deleteTaskMutation = useDeleteTask();
  const inviteMutation = useInviteCaregiver();

  const pets: PetResponse[] = petsData?.content || [];
  const tasks: TarefaResponse[] = tasksData?.content || [];
  const redeCuidado: RedeCuidadoResponse | undefined = redeCuidadoData;

  // Cadastrar novo pet na API Java (POST /pets)
  const cadastrarPet = useCallback(
    (formPet: PetFormData, callbacks?: ActionCallbacks) => {
      if (!user) {
        Alert.alert('Sessão expirada', 'Faça login novamente para cadastrar um pet.');
        return;
      }

      const validacao = PetSchema.safeParse(formPet);
      if (!validacao.success) {
        Alert.alert('Dados do Pet', formatZodError(validacao.error));
        return;
      }

      const dataNasc = normalizarDataNascParaIso(validacao.data.dataNasc);

      createPetMutation.mutate(
        {
          nome: formPet.nome.trim(),
          dataNasc,
          raca: formPet.raca.trim(),
          porte: formPet.porte,
          sexo: formPet.sexo,
          castrado: formPet.castrado,
          usuarioId: user.id,
        },
        {
          onSuccess: () => {
            Alert.alert('Sucesso!', 'Novo pet cadastrado na família com sucesso!');
            callbacks?.onSuccess?.();
          },
          onError: (err) => {
            Alert.alert('Erro', 'Não foi possível cadastrar o pet na API Java.');
            callbacks?.onError?.(err);
          },
        }
      );
    },
    [user, createPetMutation]
  );

  // Cadastrar nova tarefa para o pet na API Java (POST /tarefas)
  const cadastrarTarefa = useCallback(
    (data: TaskFormData, callbacks?: ActionCallbacks) => {
      if (!user) {
        Alert.alert('Sessão expirada', 'Faça login novamente para cadastrar uma tarefa.');
        return;
      }

      const validacao = TaskSchema.safeParse(data);
      if (!validacao.success) {
        Alert.alert('Dados da Tarefa', formatZodError(validacao.error));
        return;
      }

      const prazoData = new Date();
      prazoData.setHours(23, 59, 0, 0);

      createTaskMutation.mutate(
        {
          titulo: data.titulo.trim(),
          descricao: data.descricao.trim(),
          pontosTarefa: Number(data.pontos),
          prazo: prazoData.toISOString(),
          usuarioId: user.id,
          petId: data.petId,
          status: 'PENDENTE',
        },
        {
          onSuccess: () => {
            Alert.alert('Sucesso!', 'Tarefa criada para a rotina do pet!');
            callbacks?.onSuccess?.();
          },
          onError: (err) => {
            Alert.alert('Erro', 'Não foi possível cadastrar a tarefa na API Java.');
            callbacks?.onError?.(err);
          },
        }
      );
    },
    [user, createTaskMutation]
  );

  // Enviar convite de co-cuidador (POST /pets/{id}/cuidadores)
  const convidarCuidador = useCallback(
    (data: InviteCaregiverData, callbacks?: ActionCallbacks) => {
      if (!user) {
        Alert.alert('Sessão expirada', 'Faça login novamente para enviar convite.');
        return;
      }

      const validacao = InviteCaregiverSchema.safeParse(data);
      if (!validacao.success) {
        Alert.alert('Dados do Convite', formatZodError(validacao.error));
        return;
      }

      inviteMutation.mutate(
        {
          petId: validacao.data.petId,
          responsavelPrincipalId: user.id,
          email: data.email.trim().toLowerCase(),
        },
        {
          onSuccess: () => {
            Alert.alert('Convite Enviado!', 'O cuidador foi vinculado à rede de cuidados do pet.');
            callbacks?.onSuccess?.();
          },
          onError: (err) => {
            Alert.alert('Erro', 'Não foi possível enviar o convite.');
            callbacks?.onError?.(err);
          },
        }
      );
    },
    [user, inviteMutation]
  );

  // Remover tarefa da rotina do pet (DELETE /tarefas/{id})
  const removerTarefa = useCallback(
    (taskId: number, callbacks?: ActionCallbacks) => {
      deleteTaskMutation.mutate(taskId, {
        onSuccess: () => {
          Alert.alert('Pronto', 'Tarefa removida com sucesso.');
          callbacks?.onSuccess?.();
        },
        onError: (err) => {
          Alert.alert('Erro', 'Não foi possível excluir a tarefa.');
          callbacks?.onError?.(err);
        },
      });
    },
    [deleteTaskMutation]
  );

  return {
    user,
    pets,
    tasks,
    redeCuidado,
    isLoading: (isLoadingPets || isLoadingRede) && pets.length === 0,
    isFetching: isFetchingPets || isFetchingTasks || isFetchingRede,
    isLoadingTasks,
    cadastrarPet,
    cadastrarTarefa,
    convidarCuidador,
    removerTarefa,
    isCreatingPet: createPetMutation.isPending,
    isCreatingTask: createTaskMutation.isPending,
    isInvitingCaregiver: inviteMutation.isPending,
    isDeletingTask: deleteTaskMutation.isPending,
    refetchAll: () => {
      refetchPets();
      refetchTasks();
      refetchRede();
    },
  };
}
