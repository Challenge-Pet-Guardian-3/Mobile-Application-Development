import { useState, useCallback, useMemo } from 'react';
import { Alert } from 'react-native';
import { useSession } from './useSession';
import { usePets, usePetsPontosMap, useCreatePet, useInviteCaregiver } from './usePets';
import { useUserTasks, useTasks, useCreateTask } from './useTasks';
import { useTaskActions } from './useTaskActions';
import { useRedeCuidado } from './useRedeCuidado';
import { useFamilyModals } from './useFamilyModals';
import { normalizarDataNascParaIso, normalizarPrazoParaIso, formatarPapelCuidador } from '../utils/petUtils';
import { PetResponse, PetFormData } from '../types/pet';
import { TarefaResponse, TaskFormData } from '../types/task';
import { RedeCuidadoResponse, InviteCaregiverData } from '../types/user';
import { PetSchema, TaskSchema, InviteCaregiverSchema, formatZodError } from '../utils/schemas';
import { createMutationCallbacks, ActionCallbacks } from '../utils/apiError';
import { formatarDataIsoYmd } from '../utils/streakUtils';
import { filtrarTarefasHoje, ordenarTarefasRotina } from '../utils/taskUtils';

export type { ActionCallbacks };

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

  // Fallback global de tarefas apenas caso não haja usuário logado
  const { data: globalTasksData } = useTasks(0, 100, !user?.id);
  const { data: redeCuidadoData, isLoading: isLoadingRede, isFetching: isFetchingRede, refetch: refetchRede } = useRedeCuidado(user?.id);

  const pets: PetResponse[] = petsData?.content || [];

  // Busca pontuação individual de cada pet da família via hook dedicado do TanStack (usePetsPontosMap)
  const pontosMap = usePetsPontosMap(pets);

  // Mutations
  const createPetMutation = useCreatePet();
  const createTaskMutation = useCreateTask();
  const inviteMutation = useInviteCaregiver();

  const taskActions = useTaskActions();

  const allTasks: TarefaResponse[] = user?.id
    ? userTasksData?.content || []
    : globalTasksData?.content || [];
  const redeCuidado: RedeCuidadoResponse | undefined = redeCuidadoData;

  const hojeYmd = useMemo(() => formatarDataIsoYmd(new Date()), []);

  const tasksHoje = useMemo(() => {
    return ordenarTarefasRotina(filtrarTarefasHoje(allTasks, hojeYmd));
  }, [allTasks, hojeYmd]);

  const [filtroRotina, setFiltroRotina] = useState<'HOJE' | 'TODAS'>('HOJE');

  const tasksExibidas = useMemo(() => {
    return filtroRotina === 'HOJE' ? tasksHoje : ordenarTarefasRotina(allTasks);
  }, [filtroRotina, tasksHoje, allTasks]);

  // Cadastrar novo animal na família (POST /pets)
  const cadastrarPet = useCallback(
    (data: PetFormData, callbacks?: ActionCallbacks) => {
      if (!user) return Alert.alert('Sessão expirada', 'Faça login novamente para cadastrar um pet.');
      const validacao = PetSchema.safeParse(data);
      if (!validacao.success) return Alert.alert('Dados Inválidos', formatZodError(validacao.error));

      createPetMutation.mutate(
        {
          nome: data.nome.trim(),
          raca: data.raca.trim(),
          dataNasc: normalizarDataNascParaIso(data.dataNasc),
          porte: data.porte,
          sexo: data.sexo,
          castrado: data.castrado,
          usuarioId: user.id,
        },
        createMutationCallbacks('Erro ao Cadastrar Pet', 'Não foi possível cadastrar o pet na API.', callbacks)
      );
    },
    [user, createPetMutation]
  );

  // Cadastrar nova rotina/tarefa para um pet (POST /tarefas)
  const cadastrarTarefa = useCallback(
    (data: TaskFormData, callbacks?: ActionCallbacks) => {
      if (!user) return Alert.alert('Sessão expirada', 'Faça login novamente para criar uma tarefa.');
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
        createMutationCallbacks('Erro ao Cadastrar Tarefa', 'Não foi possível cadastrar a tarefa na API.', callbacks)
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
        createMutationCallbacks('Erro ao Convidar Cuidador', 'Não foi possível enviar o convite.', callbacks)
      );
    },
    [user, inviteMutation]
  );

  // Mapeamento e estruturas pré-processadas (KISS & DRY)
  const petsResumoMap = useMemo(
    () => new Map((redeCuidado?.pets || []).map((p) => [p.id, p])),
    [redeCuidado?.pets]
  );

  const petsOndeSouPrincipal = useMemo(
    () => pets.filter((p) => petsResumoMap.get(p.id)?.responsavelPrincipal ?? true),
    [pets, petsResumoMap]
  );

  // Controle Unificado de Modais da Tela Family via useFamilyModals
  const modals = useFamilyModals({
    user,
    petsOndeSouPrincipal,
    cadastrarTarefa,
    atualizarTarefa: taskActions.atualizar,
  });

  const alternarStatusTarefa = useCallback(
    (taskId: number) => {
      taskActions.alternarStatus(taskId, allTasks, {
        onEdit: modals.abrirEdicaoTarefa,
      });
    },
    [taskActions, allTasks, modals.abrirEdicaoTarefa]
  );

  // Remover tarefa da rotina do pet (DELETE /tarefas/{id})
  const removerTarefa = useCallback(
    (taskId: number, callbacks?: ActionCallbacks) => {
      taskActions.excluirComConfirmacao(taskId, callbacks);
    },
    [taskActions]
  );

  // Co-cuidadores da rede de cuidado
  const coCuidadores = redeCuidado?.coCuidadores || [];

  const petsComMetadados = useMemo(
    () => pets.map((p) => {
      const resumo = petsResumoMap.get(p.id);
      return {
        ...p,
        isResponsavelPrincipal: resumo?.responsavelPrincipal ?? true,
        tarefasCount: resumo?.tarefaIds.length,
        pontosTotais: pontosMap.get(p.id),
      };
    }),
    [pets, petsResumoMap, pontosMap]
  );

  // Paginação dos animais da família (4 pets por página)
  const PETS_PAGE_SIZE = 4;
  const [petsPage, setPetsPage] = useState(0);
  const petsTotalPages = Math.max(1, Math.ceil(petsComMetadados.length / PETS_PAGE_SIZE));
  const safePetsPage = Math.min(petsPage, Math.max(0, petsTotalPages - 1));

  const petsExibidos = useMemo(() => {
    return petsComMetadados.slice(safePetsPage * PETS_PAGE_SIZE, (safePetsPage + 1) * PETS_PAGE_SIZE);
  }, [petsComMetadados, safePetsPage]);

  const coCuidadoresFormatados = useMemo(
    () => coCuidadores.map((c) => ({
      ...c,
      roleText: formatarPapelCuidador(
        Boolean(c.responsavelPrincipal),
        c.responsavelPrincipal ? (c.petNomes ?? []) : [],
        !c.responsavelPrincipal ? (c.petNomes ?? []) : []
      ),
    })),
    [coCuidadores]
  );

  const currentUserCaregiver = useMemo(() => {
    if (!user) return null;
    const petsPrincipalNomes = petsOndeSouPrincipal.map((p) => p.nome).filter(Boolean);
    const petsAjudaNomes = pets
      .filter((p) => !petsOndeSouPrincipal.some((op) => op.id === p.id))
      .map((p) => p.nome)
      .filter(Boolean);
    const isPrincipal = petsPrincipalNomes.length > 0;

    return {
      id: user.id,
      nome: user.nome || 'Tutor',
      email: user.email,
      isPrincipal,
      roleText: formatarPapelCuidador(isPrincipal, petsPrincipalNomes, petsAjudaNomes),
    };
  }, [user, pets, petsOndeSouPrincipal]);

  const isHoje = filtroRotina === 'HOJE';

  const routineData = useMemo(() => ({
    title: isHoje ? 'Rotina de Hoje' : 'Rotina & Tarefas',
    subtitle: `${tasksExibidas.length} tarefa${tasksExibidas.length === 1 ? '' : 's'} ${isHoje ? 'hoje' : 'no total'}`,
    filter: filtroRotina,
    onFilterChange: setFiltroRotina,
    countHoje: tasksHoje.length,
    countTodas: allTasks.length,
    tasks: tasksExibidas,
    onToggleTask: alternarStatusTarefa,
    onEditTask: modals.abrirEdicaoTarefa,
    onDeleteTask: removerTarefa,
  }), [
    isHoje,
    tasksExibidas.length,
    filtroRotina,
    setFiltroRotina,
    tasksHoje.length,
    allTasks.length,
    tasksExibidas,
    alternarStatusTarefa,
    modals.abrirEdicaoTarefa,
    removerTarefa,
  ]);

  const familySummary = {
    tutorNome: user?.nome,
    petsCount: pets.length,
    tarefasPendentes: redeCuidado?.totalTarefasPendentes ?? allTasks.filter((t) => t.status === 'PENDENTE').length,
    tarefasConcluidas: redeCuidado?.totalTarefasConcluidas ?? 0,
    pontosAcumulados: redeCuidado?.pontosAcumulados ?? 0,
  };

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
      currentUserCaregiver,
      pets,
      petsComMetadados,
      petsExibidos,
      petsPagination: {
        currentPage: safePetsPage,
        totalPages: petsTotalPages,
        totalElements: petsComMetadados.length,
        onPageChange: setPetsPage,
      },
      summary: familySummary,
      routineData,
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
      isUpdatingTask: taskActions.isUpdating,
      isInvitingCaregiver: inviteMutation.isPending,
      isDeletingTask: taskActions.isDeleting,
    },
  };
}
