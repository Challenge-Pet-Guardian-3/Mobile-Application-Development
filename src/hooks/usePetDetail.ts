import { useState, useMemo, useCallback, useEffect } from 'react';
import { Alert } from 'react-native';
import { useSession } from './useSession';
import {
  usePets,
  usePetHistory,
  useUpdatePet,
  useDeletePet,
  usePetCaregivers,
  useInviteCaregiver,
  useRemoveCaregiver,
  useTransferResponsibility,
} from './usePets';
import {
  usePetHistoricos,
  useCreateHistorico,
  useUpdateHistorico,
  useDeleteHistorico,
} from './useHistoricos';
import { PetFormData } from '../components/PetFormModal';
import { CoCuidadorResponse, PetResponse } from '../types/pet';
import { HistoricoResponse } from '../types/historico';
import { normalizarDataNascParaIso, formatarIsoParaBr } from '../utils/petUtils';
import { PetSchema, formatZodError } from '../utils/schemas';

export interface ActionCallbacks {
  onSuccess?: () => void;
  onError?: (error: unknown) => void;
}

export function usePetDetail(routePetId?: number) {
  const { user } = useSession();

  // Lista de todos os pets do usuário
  const { data: petsData, isLoading: isLoadingPets, refetch: refetchPets } = usePets();
  const pets: PetResponse[] = petsData?.content || [];

  const [selectedPetId, setSelectedPetId] = useState<number | null>(routePetId || null);

  useEffect(() => {
    if (routePetId) {
      setSelectedPetId(routePetId);
    }
  }, [routePetId]);

  // Resolução do pet ativo
  const activePet: PetResponse | undefined = useMemo(() => {
    if (pets.length === 0) return undefined;
    if (selectedPetId) {
      const found = pets.find((p) => p.id === selectedPetId);
      if (found) return found;
    }
    return pets[0];
  }, [pets, selectedPetId]);

  // Histórico consolidado de rotina do pet na API Java (GET /pets/{id}/historico)
  const { data: historyData, isLoading: isLoadingHistory, refetch: refetchHistory } = usePetHistory(activePet?.id);

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
    if (!user || !caregivers.length) return true;
    const meuVinculo = caregivers.find((c: CoCuidadorResponse) => c.usuarioId === user.id);
    return meuVinculo ? meuVinculo.responsavelPrincipal : true;
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
    if (!activePet) return null;
    return {
      nome: activePet.nome,
      raca: activePet.raca,
      dataNasc: formatarIsoParaBr(activePet.dataNasc),
      porte: activePet.porte || 'MEDIO',
      sexo: activePet.sexo || 'M',
      castrado: activePet.castrado || false,
      avatarId: activePet.avatarId || '1',
    };
  }, [activePet]);

  // Salvar edição do pet na API Java (PUT /pets/{id})
  const salvarEdicaoPet = useCallback(
    (formData: PetFormData, callbacks?: ActionCallbacks) => {
      if (!activePet || !user) {
        Alert.alert('Erro', 'Sessão inválida ou nenhum pet selecionado.');
        return;
      }
      const validacao = PetSchema.safeParse(formData);
      if (!validacao.success) {
        Alert.alert('Dados do Pet', formatZodError(validacao.error));
        return;
      }

      const dataNasc = normalizarDataNascParaIso(formData.dataNasc || activePet.dataNasc || '');

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
            avatarId: formData.avatarId || activePet.avatarId || '1',
          },
        },
        {
          onSuccess: () => {
            Alert.alert('Sucesso!', 'Ficha do pet atualizada!');
            callbacks?.onSuccess?.();
          },
          onError: (err) => {
            Alert.alert('Erro', 'Não foi possível atualizar o pet na API.');
            callbacks?.onError?.(err);
          },
        }
      );
    },
    [activePet, user, updatePetMutation]
  );

  // Excluir pet com confirmação (DELETE /pets/{id})
  const excluirPet = useCallback(
    (callbacks?: ActionCallbacks) => {
      if (!activePet) return;

      Alert.alert(
        'Remover Pet',
        `Deseja realmente excluir a ficha de ${activePet.nome}?`,
        [
          { text: 'Cancelar', style: 'cancel' },
          {
            text: 'Excluir',
            style: 'destructive',
            onPress: () => {
              deletePetMutation.mutate(activePet.id, {
                onSuccess: () => {
                  setSelectedPetId(null);
                  Alert.alert('Pronto', 'Pet removido com sucesso.');
                  callbacks?.onSuccess?.();
                },
                onError: (err) => {
                  Alert.alert('Erro', 'Não foi possível excluir o pet.');
                  callbacks?.onError?.(err);
                },
              });
            },
          },
        ]
      );
    },
    [activePet, deletePetMutation]
  );

  // Convidar co-cuidador para o pet ativo
  const convidarCuidador = useCallback(
    (email: string, callbacks?: ActionCallbacks) => {
      if (!activePet || !user) return;

      inviteCaregiverMutation.mutate(
        {
          petId: activePet.id,
          responsavelPrincipalId: user.id,
          email: email.trim().toLowerCase(),
        },
        {
          onSuccess: () => {
            Alert.alert('Convite Enviado!', `Co-cuidador vinculado ao pet ${activePet.nome}.`);
            callbacks?.onSuccess?.();
          },
          onError: () => {
            Alert.alert('Erro', 'Não foi possível enviar o convite. Verifique se o e-mail está cadastrado.');
            callbacks?.onError?.(new Error('Erro no convite'));
          },
        }
      );
    },
    [activePet, user, inviteCaregiverMutation]
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
              {
                onSuccess: () => {
                  Alert.alert('Sucesso', isSelf ? 'Você saiu do cuidado deste pet.' : 'Cuidador desvinculado.');
                  callbacks?.onSuccess?.();
                },
                onError: () => {
                  Alert.alert('Erro', 'Não foi possível desvincular o cuidador.');
                  callbacks?.onError?.(new Error('Erro ao desvincular'));
                },
              }
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
                {
                  onSuccess: () => {
                    Alert.alert('Sucesso!', `${nomeNovoResponsavel} agora é o responsável principal.`);
                    callbacks?.onSuccess?.();
                  },
                  onError: () => {
                    Alert.alert('Erro', 'Não foi possível transferir a responsabilidade principal.');
                    callbacks?.onError?.(new Error('Erro ao transferir'));
                  },
                }
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
        {
          onSuccess: () => {
            Alert.alert('Sucesso!', 'Registro de saúde salvo no prontuário.');
            callbacks?.onSuccess?.();
          },
          onError: () => {
            Alert.alert('Erro', 'Não foi possível registrar o histórico de saúde.');
            callbacks?.onError?.(new Error('Erro ao criar histórico'));
          },
        }
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
        {
          onSuccess: () => {
            Alert.alert('Sucesso!', 'Registro de saúde atualizado com sucesso.');
            callbacks?.onSuccess?.();
          },
          onError: () => {
            Alert.alert('Erro', 'Não foi possível atualizar o registro.');
            callbacks?.onError?.(new Error('Erro ao atualizar histórico'));
          },
        }
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
                {
                  onSuccess: () => {
                    Alert.alert('Pronto', 'Registro de saúde removido.');
                    callbacks?.onSuccess?.();
                  },
                  onError: () => {
                    Alert.alert('Erro', 'Não foi possível excluir o registro.');
                    callbacks?.onError?.(new Error('Erro ao excluir histórico'));
                  },
                }
              );
            },
          },
        ]
      );
    },
    [activePet, deleteHistoricoMutation]
  );

  return {
    pets,
    activePet,
    selectedPetId,
    setSelectedPetId,
    historyData,
    historicos,
    caregivers,
    isResponsavelPrincipal,
    initialPetData,
    isLoading: isLoadingPets && pets.length === 0,
    isLoadingHistory,
    isLoadingHistoricos,
    isLoadingCaregivers,
    salvarEdicaoPet,
    excluirPet,
    convidarCuidador,
    removerCuidador,
    transferirResponsabilidade,
    criarHistorico,
    atualizarHistorico,
    excluirHistorico,
    isUpdatingPet: updatePetMutation.isPending,
    isDeletingPet: deletePetMutation.isPending,
    isInvitingCaregiver: inviteCaregiverMutation.isPending,
    isRemovingCaregiver: removeCaregiverMutation.isPending,
    isTransferringResponsibility: transferResponsibilityMutation.isPending,
    isSavingHistorico: createHistoricoMutation.isPending || updateHistoricoMutation.isPending,
    refetchAll: () => {
      refetchPets();
      refetchHistory();
      refetchHistoricos();
      refetchCaregivers();
    },
  };
}


