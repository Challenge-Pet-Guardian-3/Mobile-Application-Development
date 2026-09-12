import { useMemo, useCallback } from 'react';
import { Alert } from 'react-native';
import { useSession } from './useSession';
import { useActivePet } from './useActivePet';
import { usePets, usePetHistory, usePetPontos, useUpdatePet, useDeletePet, usePetCaregivers, useInviteCaregiver, useRemoveCaregiver, useTransferResponsibility } from './usePets';
import { usePetHistoricos, useCreateHistorico, useUpdateHistorico, useDeleteHistorico } from './useHistoricos';
import { usePetDetailModals } from './usePetDetailModals';
import { CoCuidadorResponse, PetResponse, PetFormData } from '../types/pet';
import { normalizarDataNascParaIso, formatarIsoParaBr } from '../utils/petUtils';
import { PetSchema, formatZodError } from '../utils/schemas';
import { createMutationCallbacks, ActionCallbacks } from '../utils/apiError';

export type { ActionCallbacks };

export function usePetDetail(routePetId?: number, onGoBack?: () => void) {
  const { user } = useSession();

  // Lista de todos os pets do usuário
  const { data: petsData, isLoading: isLoadingPets, refetch: refetchPets } = usePets();
  const pets: PetResponse[] = petsData?.content || [];

  const { activePet, selectedPetId, selectPet, setSelectedPetId } = useActivePet(pets, routePetId);

  // Histórico consolidado de rotina do pet na API Java (GET /pets/{id}/historico)
  const { data: historyData, isLoading: isLoadingHistory, refetch: refetchHistory } = usePetHistory(activePet?.id);

  // Pontuação e XP acumulado do pet (GET /pets/{id}/pontos)
  const { data: pontosData, isLoading: isLoadingPontos, refetch: refetchPontos } = usePetPontos(activePet?.id);

  // Prontuário de Saúde e Eventos Clínicos do pet (GET /historicos/pet/{petId})
  const {
    data: historicos = [],
    isLoading: isLoadingHistoricos,
    refetch: refetchHistoricos,
  } = usePetHistoricos(activePet?.id);

  // Cuidadores vinculados ao pet (GET /pets/{id}/cuidadores)
  const {
    data: caregivers = [],
    isLoading: isLoadingCaregivers,
    refetch: refetchCaregivers,
  } = usePetCaregivers(activePet?.id);

  // Verifica se o usuário autenticado é o responsável principal deste pet
  const isResponsavelPrincipal = useMemo(() => {
    if (!user) return false;
    if (caregivers.length > 0) {
      const meuVinculo = caregivers.find((c: CoCuidadorResponse) => c.usuarioId === user.id);
      return meuVinculo ? Boolean(meuVinculo.responsavelPrincipal) : false;
    }
    return true;
  }, [user, caregivers]);

  // Mutações de Pet e Caregivers
  const updatePetMutation = useUpdatePet();
  const deletePetMutation = useDeletePet();
  const inviteCaregiverMutation = useInviteCaregiver();
  const removeCaregiverMutation = useRemoveCaregiver();
  const transferResponsibilityMutation = useTransferResponsibility();

  // Mutações de Histórico Clínico (/historicos)
  const createHistoricoMutation = useCreateHistorico();
  const updateHistoricoMutation = useUpdateHistorico();
  const deleteHistoricoMutation = useDeleteHistorico();

  // Dados iniciais formatados para o modal de edição
  const initialPetData = useMemo(() => {
    if (!activePet) return undefined;
    return {
      nome: activePet.nome,
      raca: activePet.raca,
      dataNasc: formatarIsoParaBr(activePet.dataNasc),
      porte: activePet.porte,
      sexo: activePet.sexo,
      castrado: activePet.castrado,
    };
  }, [activePet]);

  // Salvar edição do pet na API Java (PUT /pets/{id})
  const salvarEdicaoPet = useCallback(
    (formData: PetFormData, callbacks?: ActionCallbacks) => {
      if (!activePet || !user) {
        Alert.alert('Erro', 'Sessão inválida ou nenhum pet selecionado.');
        return;
      }
      if (!isResponsavelPrincipal) {
        Alert.alert('Acesso Negado', 'Somente o tutor principal pode editar as informações cadastrais deste pet.');
        return;
      }

      const validacao = PetSchema.safeParse(formData);
      if (!validacao.success) {
        Alert.alert('Dados do Pet', formatZodError(validacao.error));
        return;
      }

      const dataNasc = normalizarDataNascParaIso(formData.dataNasc);

      updatePetMutation.mutate(
        {
          id: activePet.id,
          data: {
            nome: formData.nome.trim(),
            dataNasc,
            raca: formData.raca.trim(),
            porte: formData.porte,
            sexo: formData.sexo,
            castrado: formData.castrado,
            usuarioId: user.id,
          },
        },
        createMutationCallbacks('Erro ao Atualizar Pet', 'Não foi possível atualizar o pet na API.', callbacks)
      );
    },
    [activePet, user, isResponsavelPrincipal, updatePetMutation]
  );

  // Excluir pet com confirmação (DELETE /pets/{id})
  const excluirPet = useCallback(
    (callbacks?: ActionCallbacks) => {
      if (!activePet) return;
      if (!isResponsavelPrincipal) {
        Alert.alert('Acesso Negado', 'Somente o tutor principal tem permissão para excluir a ficha deste pet.');
        return;
      }

      Alert.alert(
        'Remover Pet',
        `Deseja realmente excluir a ficha de ${activePet.nome}?`,
        [
          { text: 'Cancelar', style: 'cancel' },
          {
            text: 'Excluir',
            style: 'destructive',
            onPress: () => {
              deletePetMutation.mutate(
                { id: activePet.id, usuarioId: user?.id },
                createMutationCallbacks('Erro ao Excluir Pet', 'Não foi possível excluir o pet.', {
                  onSuccess: () => {
                    setSelectedPetId(undefined);
                    callbacks?.onSuccess?.();
                  },
                  onError: callbacks?.onError,
                })
              );
            },
          },
        ]
      );
    },
    [activePet, isResponsavelPrincipal, user?.id, deletePetMutation, setSelectedPetId]
  );

  // Convidar co-cuidador para o pet ativo
  const convidarCuidador = useCallback(
    (email: string, callbacks?: ActionCallbacks) => {
      if (!activePet || !user) return;
      if (!isResponsavelPrincipal) {
        Alert.alert('Acesso Negado', 'Somente o tutor principal tem permissão para convidar novos cuidadores para este pet.');
        return;
      }

      inviteCaregiverMutation.mutate(
        {
          petId: activePet.id,
          responsavelPrincipalId: user.id,
          email: email.trim().toLowerCase(),
        },
        createMutationCallbacks('Erro ao Convidar Cuidador', 'Não foi possível enviar o convite. Verifique se o e-mail está cadastrado.', callbacks)
      );
    },
    [activePet, user, isResponsavelPrincipal, inviteCaregiverMutation]
  );

  // Desvincular co-cuidador
  const removerCuidador = useCallback(
    (cuidadorId: number, nomeCuidador: string, callbacks?: ActionCallbacks) => {
      if (!activePet || !user) return;

      const isSelf = cuidadorId === user.id;
      const title = isSelf ? 'Sair do Cuidado' : 'Remover Cuidador';
      const msg = isSelf
        ? `Deseja deixar de cuidar de ${activePet.nome}?`
        : `Deseja desvincular ${nomeCuidador} dos cuidados de ${activePet.nome}?`;

      Alert.alert(title, msg, [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: isSelf ? 'Sair' : 'Remover',
          style: 'destructive',
          onPress: () => {
            removeCaregiverMutation.mutate(
              {
                petId: activePet.id,
                usuarioId: cuidadorId,
                solicitanteId: user.id,
              },
              createMutationCallbacks('Erro ao Desvincular Cuidador', 'Não foi possível desvincular o cuidador.', callbacks)
            );
          },
        },
      ]);
    },
    [activePet, user, removeCaregiverMutation]
  );

  // Transferir titularidade de responsável principal
  const transferirResponsabilidade = useCallback(
    (novoResponsavelId: number, nomeNovoResponsavel: string, callbacks?: ActionCallbacks) => {
      if (!activePet || !user) return;

      Alert.alert(
        'Transferir Titularidade',
        `Deseja transferir a responsabilidade principal de ${activePet.nome} para ${nomeNovoResponsavel}? Você passará a ser um co-cuidador.`,
        [
          { text: 'Cancelar', style: 'cancel' },
          {
            text: 'Transferir',
            style: 'default',
            onPress: () => {
              transferResponsibilityMutation.mutate(
                {
                  petId: activePet.id,
                  responsavelAtualId: user.id,
                  novoResponsavelId,
                },
                createMutationCallbacks('Erro na Transferência', 'Não foi possível transferir a responsabilidade principal.', callbacks)
              );
            },
          },
        ]
      );
    },
    [activePet, user, transferResponsibilityMutation]
  );

  // Criar Registro de Histórico Clínico (POST /historicos)
  const criarHistorico = useCallback(
    (data: { tipoHist: string; dataHist: string }, callbacks?: ActionCallbacks) => {
      if (!activePet) return;

      createHistoricoMutation.mutate(
        {
          tipoHist: data.tipoHist,
          dataHist: data.dataHist,
          petId: activePet.id,
        },
        createMutationCallbacks('Erro no Prontuário', 'Não foi possível registrar o histórico de saúde.', callbacks)
      );
    },
    [activePet, createHistoricoMutation]
  );

  // Atualizar Registro de Histórico Clínico (PUT /historicos/{id})
  const atualizarHistorico = useCallback(
    (id: number, data: { tipoHist: string; dataHist: string }, callbacks?: ActionCallbacks) => {
      if (!activePet) return;

      updateHistoricoMutation.mutate(
        {
          id,
          data: {
            tipoHist: data.tipoHist,
            dataHist: data.dataHist,
            petId: activePet.id,
          },
        },
        createMutationCallbacks('Erro no Prontuário', 'Não foi possível atualizar o registro.', callbacks)
      );
    },
    [activePet, updateHistoricoMutation]
  );

  // Excluir Registro de Histórico Clínico (DELETE /historicos/{id})
  const excluirHistorico = useCallback(
    (id: number, tipoHist: string, callbacks?: ActionCallbacks) => {
      if (!activePet) return;

      Alert.alert(
        'Excluir Registro',
        `Deseja realmente remover o registro "${tipoHist}" do prontuário?`,
        [
          { text: 'Cancelar', style: 'cancel' },
          {
            text: 'Excluir',
            style: 'destructive',
            onPress: () => {
              deleteHistoricoMutation.mutate(
                { id, petId: activePet.id },
                createMutationCallbacks('Erro ao Excluir Registro', 'Não foi possível excluir o registro.', callbacks)
              );
            },
          },
        ]
      );
    },
    [activePet, deleteHistoricoMutation]
  );

  // Gestão Unificada de Modais da Tela de Detalhes do Pet via usePetDetailModals
  const modals = usePetDetailModals({
    activePet,
    isResponsavelPrincipal,
    salvarEdicaoPet,
    excluirPet,
    convidarCuidador,
    criarHistorico,
    atualizarHistorico,
    excluirHistorico,
    onGoBack,
  });

  const editTitle = activePet ? `Editar Ficha de ${activePet.nome}` : 'Editar Ficha do Pet';

  const caregiversWithActions = useMemo(
    () => caregivers.map((c: CoCuidadorResponse) => {
      const isMe = c.usuarioId === user?.id;
      return {
        ...c,
        isCurrentUser: isMe,
        onTransfer: isResponsavelPrincipal && !isMe ? () => transferirResponsabilidade(c.usuarioId, c.nome) : undefined,
        onRemove: isResponsavelPrincipal || isMe ? () => removerCuidador(c.usuarioId, c.nome) : undefined,
      };
    }),
    [caregivers, user?.id, isResponsavelPrincipal, transferirResponsabilidade, removerCuidador]
  );

  return {
    status: {
      isLoading: isLoadingPets && pets.length === 0,
      isLoadingHistory,
      isLoadingHistoricos,
      isLoadingCaregivers,
      isLoadingPontos,
      refetchAll: () => {
        refetchPets();
        refetchHistory();
        refetchHistoricos();
        refetchCaregivers();
        refetchPontos();
      },
    },
    pet: {
      list: pets,
      active: activePet,
      selectedId: selectedPetId,
      select: selectPet,
      isPrincipal: isResponsavelPrincipal,
      initialData: initialPetData,
      editTitle,
      caregivers: caregiversWithActions,
      caregiversCount: caregivers.length,
      historicos,
      historyData,
      pontos: pontosData,
    },
    modals,
    actions: {
      excluirPet: modals.excluirPet,
      removerCuidador,
      transferirResponsabilidade,
      isUpdatingPet: updatePetMutation.isPending,
      isDeletingPet: deletePetMutation.isPending,
      isInvitingCaregiver: inviteCaregiverMutation.isPending,
      isRemovingCaregiver: removeCaregiverMutation.isPending,
      isTransferringResponsibility: transferResponsibilityMutation.isPending,
      isSavingHistorico: createHistoricoMutation.isPending || updateHistoricoMutation.isPending,
    },
  };
}


