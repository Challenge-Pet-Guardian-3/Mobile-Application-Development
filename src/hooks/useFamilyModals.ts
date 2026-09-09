import { useState, useCallback, useMemo } from 'react';
import { Alert } from 'react-native';
import { PetResponse } from '../types/pet';
import { TarefaResponse, TaskFormData } from '../types/task';
import { CuidadorResumo, UsuarioResponse } from '../types/user';
import { ActionCallbacks } from './useFamilyCare';
import { getApiErrorMessage } from '../utils/apiError';
import { useInviteCaregiver, useRemoveCaregiver, useTransferResponsibility } from './usePets';

export type FamilyModalType =
  | 'novoPet'
  | 'novaTarefa'
  | 'editarTarefa'
  | 'convite'
  | 'gerenciarCuidador'
  | null;

interface UseFamilyModalsProps {
  user?: UsuarioResponse | null;
  petsOndeSouPrincipal: PetResponse[];
  cadastrarTarefa: (data: TaskFormData, callbacks?: ActionCallbacks) => void;
  atualizarTarefa: (taskId: number, data: TaskFormData, callbacks?: ActionCallbacks) => void;
  inviteMutation?: ReturnType<typeof useInviteCaregiver>;
  removeCaregiverMutation?: ReturnType<typeof useRemoveCaregiver>;
  transferResponsibilityMutation?: ReturnType<typeof useTransferResponsibility>;
}

export function useFamilyModals({
  user,
  petsOndeSouPrincipal,
  cadastrarTarefa,
  atualizarTarefa,
  inviteMutation: providedInvite,
  removeCaregiverMutation: providedRemove,
  transferResponsibilityMutation: providedTransfer,
}: UseFamilyModalsProps) {
  const defaultInvite = useInviteCaregiver();
  const defaultRemove = useRemoveCaregiver();
  const defaultTransfer = useTransferResponsibility();

  const inviteMutation = providedInvite ?? defaultInvite;
  const removeCaregiverMutation = providedRemove ?? defaultRemove;
  const transferResponsibilityMutation = providedTransfer ?? defaultTransfer;

  const [modalAtivo, setModalAtivo] = useState<FamilyModalType>(null);
  const [tarefaEmEdicao, setTarefaEmEdicao] = useState<TarefaResponse | undefined>(undefined);
  const [cuidadorEmGestao, setCuidadorEmGestao] = useState<CuidadorResumo | undefined>(undefined);

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
    setCuidadorEmGestao(undefined);
  }, []);

  const handleTogglePetVinculo = useCallback(
    (petId: number, isCurrentlyLinked: boolean) => {
      if (!cuidadorEmGestao || !user) return;

      if (isCurrentlyLinked) {
        removeCaregiverMutation.mutate(
          { petId, usuarioId: cuidadorEmGestao.id, solicitanteId: user.id },
          {
            onSuccess: () => {
              setCuidadorEmGestao((prev) =>
                prev ? { ...prev, petIds: prev.petIds.filter((id) => id !== petId) } : undefined
              );
            },
            onError: (err) => {
              Alert.alert('Erro ao Desvincular', getApiErrorMessage(err, 'Não foi possível desvincular o cuidador deste pet.'));
            },
          }
        );
      } else {
        inviteMutation.mutate(
          { petId, responsavelPrincipalId: user.id, email: cuidadorEmGestao.email },
          {
            onSuccess: () => {
              setCuidadorEmGestao((prev) =>
                prev ? { ...prev, petIds: [...prev.petIds, petId] } : undefined
              );
            },
            onError: (err) => {
              Alert.alert('Erro ao Vincular', getApiErrorMessage(err, 'Não foi possível vincular o cuidador a este pet.'));
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
        { petId, responsavelAtualId: user.id, novoResponsavelId: cuidadorEmGestao.id },
        {
          onSuccess: () => {
            handleFecharGerenciamento();
          },
          onError: (err) => {
            Alert.alert('Erro ao Transferir Titularidade', getApiErrorMessage(err, 'Não foi possível transferir a titularidade do pet.'));
          },
        }
      );
    },
    [cuidadorEmGestao, user, transferResponsibilityMutation, handleFecharGerenciamento]
  );

  const handleRemoverDeTodosPets = useCallback(() => {
    if (!cuidadorEmGestao || !user) return;

    const petsParaRemover = petsOndeSouPrincipal.filter((p) =>
      cuidadorEmGestao.petIds.includes(p.id)
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
        Alert.alert('Erro ao Remover', getApiErrorMessage(err, 'Ocorreu um erro ao desvincular o cuidador de alguns pets.'));
      });
  }, [cuidadorEmGestao, user, petsOndeSouPrincipal, removeCaregiverMutation, handleFecharGerenciamento]);

  const handleEditTask = useCallback((tarefa: TarefaResponse) => {
    setTarefaEmEdicao(tarefa);
    setModalAtivo('editarTarefa');
  }, []);

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

  const handleCloseTaskModal = useCallback(() => {
    setModalAtivo(null);
    setTarefaEmEdicao(undefined);
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
    ativo: modalAtivo,
    abrir: setModalAtivo,
    fechar: () => setModalAtivo(null),
    abrirNovoPet: () => setModalAtivo('novoPet'),
    abrirNovaTarefa: () => {
      setTarefaEmEdicao(undefined);
      setModalAtivo('novaTarefa');
    },
    abrirEditarTarefa: handleEditTask,
    abrirEdicaoTarefa: handleEditTask,
    abrirConvite: handleAbrirConvite,
    tarefaEmEdicao,
    abrirGerenciamento: handleAbrirGerenciamento,
    fecharGerenciamento: handleFecharGerenciamento,
    cuidadorEmGestao,
    togglePetVinculo: handleTogglePetVinculo,
    transferirTitularidade: handleTransferirTitularidade,
    removerDeTodosPets: handleRemoverDeTodosPets,
    initialTaskData,
    fecharModalTarefa: handleCloseTaskModal,
    submeterTarefa: handleSubmitTaskModal,
    isLoadingGerenciamento:
      removeCaregiverMutation.isPending ||
      inviteMutation.isPending ||
      transferResponsibilityMutation.isPending,
  };
}
