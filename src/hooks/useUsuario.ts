import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '../services/api';
import { useAuth } from '../contexts/AuthContext';

export interface EnderecoPayload {
  cep: string;
  numero: string;
}

export interface UsuarioUpdatePayload {
  nome: string;
  email: string;
  senha?: string;
  ddd: string;
  numeroTelefone: string;
  endereco: EnderecoPayload;
}

export interface UsuarioResponsePayload {
  id: number;
  nome: string;
  email: string;
  ddd?: string;
  numeroTelefone?: string;
  token?: string;
  enderecos?: any[];
}

export function useUsuario() {
  const queryClient = useQueryClient();
  const { userData } = useAuth();

  const {
    data: usuario,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['usuario', userData?.id],
    queryFn: async () => {
      if (!userData?.id) return null;
      const { data } = await api.get(`/usuarios/${userData.id}`);
      return data;
    },
    enabled: Boolean(userData?.id),
  });

  const updateMutation = useMutation({
    mutationFn: async (payload: UsuarioUpdatePayload) => {
      const { data } = await api.put<UsuarioResponsePayload>(`/usuarios/${userData?.id}`, payload);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['usuario', userData?.id] });
      queryClient.invalidateQueries({ queryKey: ['familia'] });
      queryClient.invalidateQueries({ queryKey: ['tarefas', userData?.id] });
    },
  });

  return {
    usuario,
    isLoading,
    error,
    refetch,
    updateUsuario: updateMutation.mutateAsync,
    isUpdating: updateMutation.isPending,
  };
}