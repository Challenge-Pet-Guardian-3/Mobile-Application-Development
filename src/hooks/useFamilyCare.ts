import { useState, useCallback, useMemo } from 'react';
import { Alert } from 'react-native';
import { useSession } from './useSession';
import { usePets, useCreatePet, useInviteCaregiver, useRemoveCaregiver, useTransferResponsibility } from './usePets';
import {
  useUserTasks,
  useTasks,
  useCreateTask,
  useUpdateTask,
  useDeleteTask,
  useCompleteTask,
  useUncompleteTask,
} from './useTasks';
import { useRedeCuidado } from './useRedeCuidado';
import { useFamilyModals } from './useFamilyModals';
import { normalizarDataNascParaIso, normalizarPrazoParaIso } from '../utils/petUtils';
import { PetFormData } from '../components/PetFormModal';
import { TaskFormData } from '../components/TaskFormModal';
import { InviteCaregiverData } from '../components/InviteCaregiverModal';
import { PetResponse } from '../types/pet';
import { TarefaResponse } from '../types/task';
import { RedeCuidadoResponse } from '../types/user';
import { PetSchema, TaskSchema, InviteCaregiverSchema, formatZodError } from '../utils/schemas';
import { getApiErrorMessage } from '../utils/apiError';
import { formatarDataIsoYmd } from '../utils/streakUtils';

export interface ActionCallbacks {
  onSuccess?: () => void;
  onError?: (error: unknown) => void;
}

function mutationCallbacks(title: string, defaultMsg: string, callbacks?: ActionCallbacks) {
  return {
    onSuccess: () => callbacks?.onSuccess?.(),
    onError: (err: unknown) => {
      Alert.alert(title, getApiErrorMessage(err, defaultMsg));
      callbacks?.onError?.(err);
    },
  };
}

export function useFamilyCare() {
  const { user } = useSession();

  // Queries de dados da família e dos pets
  const { data: petsData, isLoading: isLoadingPets, isFetching: isFetchingPets, refetch: refetchPets } = usePets();
  const {
    data: userTasksData,
    isLoading: isLoadingTasks,
    isFetching: isFetchingTasks,
    refetch: refetchTasks,
  } = useUserTasks(user?.id, 0, 100, 'ALL');

  // Fallback global de tarefas caso não haja usuário logado
  const { data: globalTasksData } = useTasks(0, 100);
  const { data: redeCuidadoData, isLoading: isLoadingRede, isFetching: isFetchingRede, refetch: refetchRede } = useRedeCuidado(user?.id);

  // Mutations
  const createPetMutation = useCreatePet();
  const createTaskMutation = useCreateTask();
  const updateTaskMutation = useUpdateTask();
  const deleteTaskMutation = useDeleteTask();
  const completeTaskMutation = useCompleteTask();
  const uncompleteTaskMutation = useUncompleteTask();
  const inviteMutation = useInviteCaregiver();
  const removeCaregiverMutation = useRemoveCaregiver();
  const transferResponsibilityMutation = useTransferResponsibility();

  const pets: PetResponse[] = petsData?.content || [];
  const allTasks: TarefaResponse[] = user?.id
    ? userTasksData?.content || []
    : globalTasksData?.content || [];
  const redeCuidado: RedeCuidadoResponse | undefined = redeCuidadoData;

  const hojeYmd = useMemo(() => formatarDataIsoYmd(new Date()), []);

  const tasksHoje = useMemo(() => {
    if (!hojeYmd) return [];
    return allTasks.filter((t) => {
      const dataPrazo = formatarDataIsoYmd(t.prazo);
      const dataConclusao = formatarDataIsoYmd(t.conclusao);
      return dataPrazo === hojeYmd || dataConclusao === hojeYmd;
    });
  }, [allTasks, hojeYmd]);

  const [filtroRotina, setFiltroRotina] = useState<'HOJE' | 'TODAS'>('HOJE');

  const tasksExibidas = useMemo(() => {
    return filtroRotina === 'HOJE' ? tasksHoje : allTasks;
  }, [filtroRotina, tasksHoje, allTasks]);

  // Cadastrar novo pet na API Java (POST /pets)
  const cadastrarPet = useCallback(
    (formPet: PetFormData, callbacks?: ActionCallbacks) => {
      if (!user) return Alert.alert('Sessão expirada', 'Faça login novamente para cadastrar um pet.');
      const validacao = PetSchema.safeParse(formPet);
      if (!validacao.success) return Alert.alert('Dados do Pet', formatZodError(validacao.error));

      createPetMutation.mutate(
        {
          nome: formPet.nome.trim(),
          dataNasc: normalizarDataNascParaIso(validacao.data.dataNasc),
          raca: formPet.raca.trim(),
          porte: formPet.porte,
          sexo: formPet.sexo,
          castrado: formPet.castrado,
          usuarioId: user.id,
        },
        mutationCallbacks('Erro ao Cadastrar Pet', 'Não foi possível cadastrar o pet na API.', callbacks)
      );
    },
    [user, createPetMutation]
  );

  // Cadastrar nova tarefa para o pet na API Java (POST /tarefas)
  const cadastrarTarefa = useCallback(
    (data: TaskFormData, callbacks?: ActionCallbacks) => {
      if (!user) return Alert.alert('Sessão expirada', 'Faça login novamente para cadastrar uma tarefa.');
      const validacao = TaskSchema.safeParse(data);
      if (!validacao.success) return Alert.alert('Dados da Tarefa', formatZodError(validacao.error));

      createTaskMutation.mutate(
        {
          titulo: data.titulo.trim(),
          descricao: data.descricao.trim(),
          pontosTarefa: Number(data.pontos),
          prazo: normalizarPrazoParaIso(data.prazo),
          usuarioId: user.id,
          petId: data.petId,
          status: data.status || 'PENDENTE',
        },
        mutationCallbacks('Erro ao Cadastrar Tarefa', 'Não foi possível cadastrar a tarefa na API.', callbacks)
      );
    },
    [user, createTaskMutation]
  );

  // Enviar convite de co-cuidador (POST /pets/{id}/cuidadores)
  const convidarCuidador = useCallback(
    (data: InviteCaregiverData, callbacks?: ActionCallbacks) => {
      if (!user) return Alert.alert('Sessão expirada', 'Faça login novamente para enviar convite.');
      const validacao = InviteCaregiverSchema.safeParse(data);
      if (!validacao.success) return Alert.alert('Dados do Convite', formatZodError(validacao.error));

      inviteMutation.mutate(
        {
          petId: validacao.data.petId,
          responsavelPrincipalId: user.id,
          email: data.email.trim().toLowerCase(),
        },
        mutationCallbacks('Erro ao Convidar Cuidador', 'Não foi possível enviar o convite.', callbacks)
      );
    },
    [user, inviteMutation]
  );

  // Atualizar tarefa existente na API Java (PUT /tarefas/{id})
  const atualizarTarefa = useCallback(
    (taskId: number, data: TaskFormData, callbacks?: ActionCallbacks) => {
      if (!user) return Alert.alert('Sessão expirada', 'Faça login novamente para atualizar uma tarefa.');
      const validacao = TaskSchema.safeParse(data);
      if (!validacao.success) return Alert.alert('Dados da Tarefa', formatZodError(validacao.error));

      const statusFinal = data.status || 'PENDENTE';
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
            prazo: normalizarPrazoParaIso(data.prazo),
            usuarioId: user.id,
            petId: data.petId,
            status: statusFinal,
            conclusao: conclusaoIso,
          },
        },
        mutationCallbacks('Erro ao Atualizar Tarefa', 'Não foi possível atualizar a tarefa.', callbacks)
      );
    },
    [user, updateTaskMutation]
  );

  // Remover tarefa da rotina do pet (DELETE /tarefas/{id})
  const removerTarefa = useCallback(
    (taskId: number, callbacks?: ActionCallbacks) => {
      deleteTaskMutation.mutate(taskId, mutationCallbacks('Erro ao Excluir Tarefa', 'Não foi possível excluir a tarefa.', callbacks));
    },
    [deleteTaskMutation]
  );

  // Concluir ou desmarcar tarefa da rotina
  const alternarStatusTarefa = useCallback(
    (taskId: number) => {
      if (!user) {
        Alert.alert('Sessão expirada', 'Faça login novamente para atualizar tarefas.');
        return;
      }

      const tarefa = allTasks.find((t) => t.id === taskId);
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
    [user, allTasks, completeTaskMutation, uncompleteTaskMutation]
  );

  // Co-cuidadores da rede de cuidado
  const coCuidadores = redeCuidado?.coCuidadores || [];

  // Mapeamento e estruturas pré-processadas (KISS & DRY)
  const petsResumoMap = useMemo(
    () => new Map((redeCuidado?.pets || []).map((p) => [p.id, p])),
    [redeCuidado?.pets]
  );

  const petsOndeSouPrincipal = useMemo(
    () => pets.filter((p) => petsResumoMap.get(p.id)?.responsavelPrincipal ?? true),
    [pets, petsResumoMap]
  );

  const petsComMetadados = useMemo(
    () => pets.map((p) => {
      const resumo = petsResumoMap.get(p.id);
      return {
        ...p,
        isResponsavelPrincipal: resumo?.responsavelPrincipal ?? true,
        tarefasCount: resumo?.tarefaIds.length,
      };
    }),
    [pets, petsResumoMap]
  );

  const coCuidadoresFormatados = useMemo(
    () => coCuidadores.map((c) => ({
      ...c,
      roleText: c.petNomes?.length ? `Ajuda com: ${c.petNomes.join(', ')}` : 'Co-cuidador',
    })),
    [coCuidadores]
  );

  const isHoje = filtroRotina === 'HOJE';
  const routineTexts = {
    title: isHoje ? 'Rotina de Hoje' : 'Rotina & Tarefas',
    subtitle: `${tasksExibidas.length} tarefa${tasksExibidas.length === 1 ? '' : 's'} ${isHoje ? 'hoje' : 'no total'}`,
    emptyTitle: isHoje ? 'Tudo em dia para hoje!' : 'Nenhuma tarefa ativa',
    emptyDesc: isHoje ? 'Nenhuma tarefa agendada para hoje na família.' : 'Crie rotinas diárias para seu pet acumular pontos XP!',
  };

  const familySummary = {
    tutorNome: user?.nome,
    petsCount: pets.length,
    tarefasPendentes: redeCuidado?.totalTarefasPendentes ?? allTasks.filter((t) => t.status === 'PENDENTE').length,
    tarefasConcluidas: redeCuidado?.totalTarefasConcluidas ?? 0,
    pontosAcumulados: redeCuidado?.pontosAcumulados ?? 0,
  };

  // Controle Unificado de Modais da Tela Family via useFamilyModals
  const modals = useFamilyModals({
    user,
    petsOndeSouPrincipal,
    cadastrarTarefa,
    atualizarTarefa,
    inviteMutation,
    removeCaregiverMutation,
    transferResponsibilityMutation,
  });

  return {
    status: {
      isLoading: (isLoadingPets || isLoadingRede) && pets.length === 0,
      isFetching: isFetchingPets || isFetchingTasks || isFetchingRede,
      isLoadingTasks,
      refetchAll: () => {
        refetchPets();
        refetchTasks();
        refetchRede();
      },
    },
    family: {
      user,
      pets,
      petsComMetadados,
      summary: familySummary,
      tasks: tasksExibidas,
      allTasks,
      todayTasks: tasksHoje,
      filtroRotina,
      setFiltroRotina,
      routineTexts,
      totalTarefasHoje: tasksHoje.length,
      totalTarefasGeral: allTasks.length,
      redeCuidado,
      coCuidadores: coCuidadoresFormatados,
      petsOndeSouPrincipal,
    },
    modals,
    actions: {
      cadastrarPet: (data: PetFormData) => cadastrarPet(data, { onSuccess: modals.fechar }),
      convidarCuidador: (data: InviteCaregiverData) => convidarCuidador(data, { onSuccess: modals.fechar }),
      removerTarefa,
      alternarStatusTarefa,
      isCreatingPet: createPetMutation.isPending,
      isCreatingTask: createTaskMutation.isPending,
      isUpdatingTask: updateTaskMutation.isPending,
      isInvitingCaregiver: inviteMutation.isPending,
      isDeletingTask: deleteTaskMutation.isPending,
    },
  };
}
