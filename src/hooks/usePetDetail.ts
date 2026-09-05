import { useState, useMemo, useCallback, useEffect } from 'react';
import { Alert } from 'react-native';
import { useSession } from './useSession';
import { usePets, usePetHistory, useUpdatePet, useDeletePet } from './usePets';
import { PetFormData } from '../components/PetFormModal';
import { PetResponse } from '../types/pet';
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

  // Histórico consolidado do pet na API Java (GET /pets/{id}/historico)
  const { data: historyData, isLoading: isLoadingHistory, refetch: refetchHistory } = usePetHistory(activePet?.id);

  // Mutações
  const updatePetMutation = useUpdatePet();
  const deletePetMutation = useDeletePet();

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

  return {
    pets,
    activePet,
    selectedPetId,
    setSelectedPetId,
    historyData,
    initialPetData,
    isLoading: isLoadingPets && pets.length === 0,
    isLoadingHistory,
    salvarEdicaoPet,
    excluirPet,
    isUpdatingPet: updatePetMutation.isPending,
    isDeletingPet: deletePetMutation.isPending,
    refetchAll: () => {
      refetchPets();
      refetchHistory();
    },
  };
}
