import { useState, useCallback, useMemo } from 'react';
import { Alert } from 'react-native';
import { useSession } from './useSession';
import { usePets, useCreatePet, useInviteCaregiver, useRemoveCaregiver, useTransferResponsibility } from './usePets';
import { useUserTasks, useTasks, useCreateTask, useUpdateTask, useDeleteTask } from './useTasks';
import { useRedeCuidado } from './useRedeCuidado';
import { normalizarDataNascParaIso, normalizarPrazoParaIso } from '../utils/petUtils';
import { PetFormData } from '../components/PetFormModal';
import { TaskFormData } from '../components/TaskFormModal';
import { InviteCaregiverData } from '../components/InviteCaregiverModal';
import { PetResponse } from '../types/pet';
import { TarefaResponse } from '../types/task';
import { CuidadorResumo, RedeCuidadoResponse } from '../types/user';
import { PetSchema, TaskSchema, InviteCaregiverSchema, formatZodError } from '../utils/schemas';
import { getApiErrorMessage } from '../utils/apiError';
import { formatarDataIsoYmd } from '../utils/streakUtils';

export interface ActionCallbacks {
  onSuccess?: () => void;
  onError?: (error: unknown) => void;
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
            callbacks?.onSuccess?.();
          },
          onError: (err) => {
            Alert.alert('Erro ao Cadastrar Pet', getApiErrorMessage(err, 'Não foi possível cadastrar o pet na API.'));
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

      const statusFinal = data.status || 'PENDENTE';
      const prazoIso = normalizarPrazoParaIso(data.prazo);

      createTaskMutation.mutate(
        {
          titulo: data.titulo.trim(),
          descricao: data.descricao.trim(),
          pontosTarefa: Number(data.pontos),
          prazo: prazoIso,
          usuarioId: user.id,
          petId: data.petId,
          status: statusFinal,
        },
        {
          onSuccess: () => {
            callbacks?.onSuccess?.();
          },
          onError: (err) => {
            Alert.alert('Erro ao Cadastrar Tarefa', getApiErrorMessage(err, 'Não foi possível cadastrar a tarefa na API.'));
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
            callbacks?.onSuccess?.();
          },
          onError: (err) => {
            Alert.alert('Erro ao Convidar Cuidador', getApiErrorMessage(err, 'Não foi possível enviar o convite.'));
            callbacks?.onError?.(err);
          },
        }
      );
    },
    [user, inviteMutation]
  );

  // Atualizar tarefa existente na API Java (PUT /tarefas/{id})
  const atualizarTarefa = useCallback(
    (taskId: number, data: TaskFormData, callbacks?: ActionCallbacks) => {
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
            Alert.alert('Erro ao Atualizar Tarefa', getApiErrorMessage(err, 'Não foi possível atualizar a tarefa.'));
            callbacks?.onError?.(err);
          },
        }
      );
    },
    [user, updateTaskMutation]
  );

  // Remover tarefa da rotina do pet (DELETE /tarefas/{id})
  const removerTarefa = useCallback(
    (taskId: number, callbacks?: ActionCallbacks) => {
      deleteTaskMutation.mutate(taskId, {
        onSuccess: () => {
          callbacks?.onSuccess?.();
        },
        onError: (err) => {
          Alert.alert('Erro ao Excluir Tarefa', getApiErrorMessage(err, 'Não foi possível excluir a tarefa.'));
          callbacks?.onError?.(err);
        },
      });
    },
    [deleteTaskMutation]
  );

  // Co-cuidadores da rede de cuidado
  const coCuidadores = redeCuidado?.coCuidadores || [];

  // Filtra apenas pets onde o usuário logado é o tutor principal
  const petsOndeSouPrincipal = useMemo(() => {
    return pets.filter((pet) => {
      const petResumo = redeCuidado?.pets?.find((p) => p.id === pet.id);
      return petResumo ? petResumo.responsavelPrincipal : true;
    });
  }, [pets, redeCuidado?.pets]);

  // Controle Unificado de Modais da Tela Family
  const [modalAtivo, setModalAtivo] = useState<
    'novoPet' | 'novaTarefa' | 'editarTarefa' | 'convite' | 'gerenciarCuidador' | null
  >(null);
  const [tarefaEmEdicao, setTarefaEmEdicao] = useState<TarefaResponse | null>(null);
  const [cuidadorEmGestao, setCuidadorEmGestao] = useState<CuidadorResumo | null>(null);

  const handleAbrirConvite = useCallback(() => {
    if (petsOndeSouPrincipal.length === 0) return;
    setModalAtivo('convite');
  }, [petsOndeSouPrincipal.length]);

  const handleAbrirGerenciamento = useCallback(
    (cuidador: CuidadorResumo) => {
      if (petsOndeSouPrincipal.length === 0) return;
      setCuidadorEmGestao(cuidador);
      setModalAtivo('gerenciarCuidador');
    },
    [petsOndeSouPrincipal.length]
  );

  const handleFecharGerenciamento = useCallback(() => {
    setModalAtivo(null);
    setCuidadorEmGestao(null);
  }, []);

  const handleTogglePetVinculo = useCallback(
    (petId: number, isCurrentlyLinked: boolean) => {
      if (!cuidadorEmGestao || !user) return;

      if (isCurrentlyLinked) {
        removeCaregiverMutation.mutate(
          {
            petId,
            usuarioId: cuidadorEmGestao.id,
            solicitanteId: user.id,
          },
          {
            onSuccess: () => {
              setCuidadorEmGestao((prev) =>
                prev ? { ...prev, petIds: prev.petIds.filter((id) => id !== petId) } : null
              );
            },
            onError: (err) => {
              Alert.alert(
                'Erro ao Desvincular',
                getApiErrorMessage(err, 'Não foi possível desvincular o cuidador deste pet.')
              );
            },
          }
        );
      } else {
        inviteMutation.mutate(
          {
            petId,
            responsavelPrincipalId: user.id,
            email: cuidadorEmGestao.email,
          },
          {
            onSuccess: () => {
              setCuidadorEmGestao((prev) =>
                prev ? { ...prev, petIds: [...prev.petIds, petId] } : null
              );
            },
            onError: (err) => {
              Alert.alert(
                'Erro ao Vincular',
                getApiErrorMessage(err, 'Não foi possível vincular o cuidador a este pet.')
              );
            },
          }
        );
      }
    },
    [cuidadorEmGestao, user, removeCaregiverMutation, inviteMutation]
  );

  const handleTransferirTitularidade = useCallback(
    (petId: number, _petNome: string) => {
      if (!cuidadorEmGestao || !user) return;

      transferResponsibilityMutation.mutate(
        {
          petId,
          responsavelAtualId: user.id,
          novoResponsavelId: cuidadorEmGestao.id,
        },
        {
          onSuccess: () => {
            handleFecharGerenciamento();
          },
          onError: (err) => {
            Alert.alert(
              'Erro ao Transferir Titularidade',
              getApiErrorMessage(err, 'Não foi possível transferir a titularidade do pet.')
            );
          },
        }
      );
    },
    [cuidadorEmGestao, user, transferResponsibilityMutation, handleFecharGerenciamento]
  );

  const handleRemoverDeTodosPets = useCallback(() => {
    if (!cuidadorEmGestao || !user) return;

    const petsParaRemover = petsOndeSouPrincipal.filter((p) =>
      cuidadorEmGestao.petIds?.includes(p.id)
    );

    if (petsParaRemover.length === 0) {
      handleFecharGerenciamento();
      return;
    }

    Promise.all(
      petsParaRemover.map((p) =>
        removeCaregiverMutation.mutateAsync({
          petId: p.id,
          usuarioId: cuidadorEmGestao.id,
          solicitanteId: user.id,
        })
      )
    )
      .then(() => {
        handleFecharGerenciamento();
      })
      .catch((err) => {
        Alert.alert(
          'Erro ao Remover',
          getApiErrorMessage(err, 'Ocorreu um erro ao desvincular o cuidador de alguns pets.')
        );
      });
  }, [cuidadorEmGestao, user, petsOndeSouPrincipal, removeCaregiverMutation, handleFecharGerenciamento]);

  const handleEditTask = useCallback((tarefa: TarefaResponse) => {
    setTarefaEmEdicao(tarefa);
    setModalAtivo('editarTarefa');
  }, []);

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

  const handleCloseTaskModal = useCallback(() => {
    setModalAtivo(null);
    setTarefaEmEdicao(null);
  }, []);

  const handleSubmitTaskModal = useCallback(
    (data: TaskFormData) => {
      if (modalAtivo === 'editarTarefa' && tarefaEmEdicao) {
        atualizarTarefa(tarefaEmEdicao.id, data, {
          onSuccess: handleCloseTaskModal,
        });
      } else {
        cadastrarTarefa(data, {
          onSuccess: handleCloseTaskModal,
        });
      }
    },
    [modalAtivo, tarefaEmEdicao, atualizarTarefa, cadastrarTarefa, handleCloseTaskModal]
  );

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
      tasks: tasksExibidas,
      allTasks,
      todayTasks: tasksHoje,
      filtroRotina,
      setFiltroRotina,
      totalTarefasHoje: tasksHoje.length,
      totalTarefasGeral: allTasks.length,
      redeCuidado,
      coCuidadores,
      petsOndeSouPrincipal,
    },
    modals: {
      ativo: modalAtivo,
      abrir: setModalAtivo,
      fechar: () => setModalAtivo(null),
      abrirConvite: handleAbrirConvite,
      tarefaEmEdicao,
      initialTaskData,
      abrirEdicaoTarefa: handleEditTask,
      fecharModalTarefa: handleCloseTaskModal,
      submeterTarefa: handleSubmitTaskModal,
      cuidadorEmGestao,
      abrirGerenciamento: handleAbrirGerenciamento,
      fecharGerenciamento: handleFecharGerenciamento,
      togglePetVinculo: handleTogglePetVinculo,
      transferirTitularidade: handleTransferirTitularidade,
      removerDeTodosPets: handleRemoverDeTodosPets,
      isLoadingGerenciamento:
        removeCaregiverMutation.isPending ||
        inviteMutation.isPending ||
        transferResponsibilityMutation.isPending,
    },
    actions: {
      cadastrarPet,
      convidarCuidador,
      removerTarefa,
      isCreatingPet: createPetMutation.isPending,
      isCreatingTask: createTaskMutation.isPending,
      isUpdatingTask: updateTaskMutation.isPending,
      isInvitingCaregiver: inviteMutation.isPending,
      isDeletingTask: deleteTaskMutation.isPending,
    },
  };
}
