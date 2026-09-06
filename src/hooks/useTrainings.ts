import { useState, useCallback } from 'react';
import { Alert } from 'react-native';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { TrainingService } from '../services/trainings';
import { queryKeys } from '../lib/queryKeys';
import { TrainingLesson, TrainingTrack } from '../types/training';
import { usePets, usePetPontos } from './usePets';
import { useSession } from './useSession';
import { PetResponse } from '../types/pet';

function useTrilhas(petId?: number, enabled = true) {
  return useQuery({
    queryKey: queryKeys.training.byPet(petId),
    queryFn: () => (petId ? TrainingService.getTrilhas(petId) : Promise.resolve([])),
    enabled: enabled && !!petId,
  });
}

function useConcluirLicao() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ trilhaId, licaoId }: { trilhaId: string; licaoId: string }) =>
      TrainingService.concluirLicao(trilhaId, licaoId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.training.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.pets.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.tasks.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.users.all });
    },
  });
}

export function useTrainings() {
  const { user } = useSession();
  const { data: petsData } = usePets();
  const pets: PetResponse[] = petsData?.content || [];

  const [selectedPetIndex, setSelectedPetIndex] = useState(0);
  const petAtivo: PetResponse | undefined = pets[selectedPetIndex] ?? pets[0];

  const isUserComum = user?.role === 'COMUM';

  const {
    data: trilhasData,
    isLoading: isLoadingTrilhas,
    isFetching: isFetchingTrilhas,
    refetch: refetchTrilhas,
  } = useTrilhas(
    petAtivo?.id,
    !isUserComum
  );
  const trilhas: TrainingTrack[] = trilhasData || [];

  const { data: pontosPetData, refetch: refetchPontos } = usePetPontos(petAtivo?.id);
  const totalXpGanho = pontosPetData?.pontosTotais ?? pontosPetData?.pontosAulas ?? 0;

  const refetch = useCallback(async () => {
    await Promise.all([refetchTrilhas(), refetchPontos()]);
  }, [refetchTrilhas, refetchPontos]);

  const [trilhaAtivaIndex, setTrilhaAtivaIndex] = useState(0);

  const [licaoSelecionada, setLicaoSelecionada] = useState<{
    trilhaId: string;
    licao: TrainingLesson;
  } | null>(null);

  const concluirLicaoMutation = useConcluirLicao();

  const handleConcluirLicao = useCallback(() => {
    if (!licaoSelecionada || !petAtivo?.id) return;

    concluirLicaoMutation.mutate(
      {
        trilhaId: licaoSelecionada.trilhaId,
        licaoId: licaoSelecionada.licao.id,
      },
      {
        onSuccess: (result) => {
          setLicaoSelecionada(null);

          Alert.alert(
            '🏆 PARABÉNS!',
            `Lição concluída! Você ganhou +${result.pontosGanhos} XP direcionados para o nível de ${petAtivo?.nome || 'seu Pet'}!`
          );
        },
        onError: () => {
          Alert.alert('Erro', 'Não foi possível registrar a lição na API.');
        },
      }
    );
  }, [licaoSelecionada, petAtivo, concluirLicaoMutation]);

  const trilhaAtual = trilhas[trilhaAtivaIndex] || trilhas[0];

  const totalLicoes = trilhaAtual?.licoes?.length || 1;
  const licoesConcluidas = trilhaAtual?.licoes?.filter((l) => l.concluido).length || 0;
  const progressoPercent = Math.round((licoesConcluidas / totalLicoes) * 100);

  return {
    status: {
      isUserComum,
      isLoadingTrilhas,
      isFetching: isFetchingTrilhas,
      isConcluindo: concluirLicaoMutation.isPending,
    },
    pet: {
      pets,
      selectedPetIndex,
      setSelectedPetIndex,
      petAtivo,
      totalXpGanho,
    },
    trail: {
      trilhas,
      trilhaAtivaIndex,
      setTrilhaAtivaIndex,
      trilhaAtual,
      totalLicoes,
      licoesConcluidas,
      progressoPercent,
      licaoSelecionada,
      setLicaoSelecionada,
    },
    actions: {
      refetch,
      concluirLicao: handleConcluirLicao,
    },
  };
}
