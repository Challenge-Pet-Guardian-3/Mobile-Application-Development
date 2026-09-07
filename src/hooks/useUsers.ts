import { useMemo } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { UserService } from '../services/users';
import { StorageService } from '../services/storage';
import { queryKeys } from '../lib/queryKeys';
import { UsuarioRequest } from '../types/user';
import { PetResponse } from '../types/pet';
import { useSession } from './useSession';
import { usePets, usePetsPontosTotais } from './usePets';
import { useUserPoints } from './useTasks';
import { useRedeCuidado } from './useRedeCuidado';

export function useUserProfileData() {
  const { user } = useSession();
  const queryClient = useQueryClient();

  const { data: petsData, isLoading: isLoadingPets, isFetching: isFetchingPets, refetch: refetchPets } = usePets();
  const { data: pontosTarefas, refetch: refetchPoints } = useUserPoints(user?.id);
  const { data: redeCuidado, isLoading: isLoadingRede, isFetching: isFetchingRede, refetch: refetchRede } = useRedeCuidado(user?.id);

  const pets: PetResponse[] = petsData?.content || [];

  const pontosTotaisPets = usePetsPontosTotais(pets);

  const pontosTotais = useMemo(() => {
    if (pontosTotaisPets !== undefined) return pontosTotaisPets;
    if (pontosTarefas !== undefined) return pontosTarefas;
    return redeCuidado?.pontosAcumulados ?? 0;
  }, [pontosTotaisPets, pontosTarefas, redeCuidado?.pontosAcumulados]);

  const refetchAll = async () => {
    await Promise.all([refetchPets(), refetchPoints(), refetchRede()]);
    queryClient.invalidateQueries({ queryKey: queryKeys.pets.all });
    queryClient.invalidateQueries({ queryKey: queryKeys.tasks.all });
  };

  return {
    pets,
    redeCuidado,
    pontosTotais,
    isLoading: isLoadingPets || isLoadingRede,
    isFetching: isFetchingPets || isFetchingRede,
    refetchAll,
  };
}

export function useUpdateUser() {
  const queryClient = useQueryClient();
  const { setUser } = useSession();

  return useMutation({
    mutationFn: async ({ id, data }: { id: number; data: UsuarioRequest }) => {
      const updatedUser = await UserService.updateUsuario(id, data);
      await StorageService.saveUser(updatedUser);
      setUser(updatedUser);
      return updatedUser;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.users.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.users.detail(data.id) });
      queryClient.invalidateQueries({ queryKey: queryKeys.users.redeCuidado(data.id) });
    },
  });
}
