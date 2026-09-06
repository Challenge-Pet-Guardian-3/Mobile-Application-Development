import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { HistoricoService } from '../services/historico';
import { queryKeys } from '../lib/queryKeys';
import { HistoricoRequest } from '../types/historico';

export function usePetHistoricos(petId?: number) {
  return useQuery({
    queryKey: queryKeys.historicos.byPet(petId),
    queryFn: () => (petId ? HistoricoService.getHistoricosByPetId(petId) : Promise.resolve([])),
    enabled: !!petId,
  });
}

export function useCreateHistorico() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: HistoricoRequest) => HistoricoService.createHistorico(data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.historicos.byPet(variables.petId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.historicos.all });
    },
  });
}

export function useUpdateHistorico() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: HistoricoRequest }) =>
      HistoricoService.updateHistorico(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.historicos.byPet(variables.data.petId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.historicos.detail(variables.id) });
      queryClient.invalidateQueries({ queryKey: queryKeys.historicos.all });
    },
  });
}

export function useDeleteHistorico() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id }: { id: number; petId: number }) => HistoricoService.deleteHistorico(id),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.historicos.byPet(variables.petId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.historicos.all });
    },
  });
}
