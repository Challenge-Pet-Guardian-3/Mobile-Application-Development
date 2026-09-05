import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { PetService } from '../services/pets';
import { queryKeys } from '../lib/queryKeys';
import { PetRequest } from '../types/pet';

export function usePets(page = 0, size = 20) {
  return useQuery({
    queryKey: queryKeys.pets.list(page, size),
    queryFn: () => PetService.getPets(page, size),
  });
}

export function usePet(id?: number) {
  return useQuery({
    queryKey: queryKeys.pets.detail(id),
    queryFn: () => (id ? PetService.getPetById(id) : Promise.reject(new Error('ID não fornecido'))),
    enabled: !!id,
  });
}

export function usePetHistory(id?: number) {
  return useQuery({
    queryKey: queryKeys.pets.history(id),
    queryFn: () => (id ? PetService.getPetHistory(id) : Promise.reject(new Error('ID não fornecido'))),
    enabled: !!id,
  });
}

export function usePetPontos(id?: number) {
  return useQuery({
    queryKey: queryKeys.pets.pontos(id),
    queryFn: () => (id ? PetService.getPetPontos(id) : Promise.reject(new Error('ID não fornecido'))),
    enabled: !!id,
  });
}

export function useCreatePet() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (petRequest: PetRequest) => PetService.createPet(petRequest),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.pets.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.users.all });
    },
  });
}

export function useUpdatePet() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: PetRequest }) => PetService.updatePet(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.pets.detail(id) });
      queryClient.invalidateQueries({ queryKey: queryKeys.pets.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.users.all });
    },
  });
}

export function useDeletePet() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => PetService.deletePet(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.pets.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.users.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.tasks.all });
    },
  });
}

export function useInviteCaregiver() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      petId,
      responsavelPrincipalId,
      email,
    }: {
      petId: number;
      responsavelPrincipalId: number;
      email: string;
    }) => PetService.convidarPorEmail(petId, responsavelPrincipalId, email),
    onSuccess: (_, { petId }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.pets.caregivers(petId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.users.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.pets.all });
    },
  });
}

export function usePetCaregivers(petId?: number) {
  return useQuery({
    queryKey: queryKeys.pets.caregivers(petId),
    queryFn: () => (petId ? PetService.getCuidadores(petId) : Promise.resolve([])),
    enabled: !!petId,
  });
}

export function useRemoveCaregiver() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      petId,
      usuarioId,
      solicitanteId,
    }: {
      petId: number;
      usuarioId: number;
      solicitanteId: number;
    }) => PetService.desvincularCuidador(petId, usuarioId, solicitanteId),
    onSuccess: (_, { petId }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.pets.caregivers(petId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.users.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.pets.all });
    },
  });
}

export function useTransferResponsibility() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      petId,
      responsavelAtualId,
      novoResponsavelId,
    }: {
      petId: number;
      responsavelAtualId: number;
      novoResponsavelId: number;
    }) =>
      PetService.transferirResponsabilidade(petId, {
        responsavelAtualId,
        novoResponsavelId,
      }),
    onSuccess: (_, { petId }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.pets.caregivers(petId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.pets.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.users.all });
    },
  });
}
