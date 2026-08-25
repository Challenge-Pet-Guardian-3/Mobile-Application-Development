import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '../services/api';
import { useAuth } from '../contexts/AuthContext';

export interface PetBackend {
  id?: number;
  nome: string;
  idade: number;
  raca: string;
  porte: 'PEQUENO' | 'MEDIO' | 'GRANDE';
  sexo: 'M' | 'F';
  castrado: boolean;
  usuarioId?: number;
  avatarId?: number | null;
  peso?: number | null;
  ultimaVacina?: string | null;
  ultimaConsulta?: string | null;
}

const fetchPets = async (): Promise<PetBackend[]> => {
  const { data } = await api.get('/pets');
  return data.content || data || [];
};

const fetchPetsByFamilia = async (): Promise<PetBackend[]> => {
  const { data } = await api.get('/pets/by-familia');
  return data.content || data || [];
};

const createPetRequest = async (novoPet: PetBackend): Promise<PetBackend> => {
  const { data } = await api.post<PetBackend>('/pets', novoPet);
  return data;
};

const updatePetRequest = async (pet: PetBackend): Promise<PetBackend> => {
  if (!pet.id) throw new Error('ID do pet não informado.');
  const { data } = await api.put<PetBackend>(`/pets/${pet.id}`, pet);
  return data;
};

const deletePetRequest = async (id: string | number): Promise<void> => {
  await api.delete(`/pets/${id}`);
};

export function usePets() {
  const queryClient = useQueryClient();
  const { userData } = useAuth();

  const {
    data: pets = [],
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: ['pets', userData?.id],
    queryFn: fetchPets,
    enabled: Boolean(userData?.id),
  });

  const createPetMutation = useMutation({
    mutationFn: (pet: Omit<PetBackend, 'id' | 'usuarioId'>) => {
      if (!userData?.id) throw new Error('Usuário não identificado.');
      return createPetRequest({
        ...pet,
        usuarioId: userData.id,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pets', userData?.id] });
      queryClient.invalidateQueries({ queryKey: ['pets-familia', userData?.id] });
    },
  });

  const updatePetMutation = useMutation({
    mutationFn: (pet: PetBackend) => {
      if (!userData?.id || !pet.id) throw new Error('Dados inválidos para atualização.');
      return updatePetRequest({
        ...pet,
        usuarioId: userData.id,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pets', userData?.id] });
      queryClient.invalidateQueries({ queryKey: ['pets-familia', userData?.id] });
    },
  });

  const deletePetMutation = useMutation({
    mutationFn: deletePetRequest,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pets', userData?.id] });
      queryClient.invalidateQueries({ queryKey: ['pets-familia', userData?.id] });
    },
  });

  return {
    pets,
    isLoading,
    isError,
    error,
    refetch,
    createPet: createPetMutation.mutateAsync,
    isCreating: createPetMutation.isPending,
    updatePet: updatePetMutation.mutateAsync,
    isUpdating: updatePetMutation.isPending,
    deletePet: deletePetMutation.mutateAsync,
    isDeleting: deletePetMutation.isPending,
  };
}

export function usePetsFamilia() {
  const { userData } = useAuth();

  const {
    data: pets = [],
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: ['pets-familia', userData?.id],
    queryFn: fetchPetsByFamilia,
    enabled: Boolean(userData?.id),
  });

  return { pets, isLoading, isError, error, refetch };
}