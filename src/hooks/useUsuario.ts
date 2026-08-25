import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '../services/api';
import { useAuth } from '../contexts/AuthContext';

// ===== Tipagens da API Java =====
export interface Endereco {
  id?: number;
  logradouro: string;
  numero?: string | null;
  complemento?: string | null;
  bairro?: string | null;
  cidade: string;
  estado: string;
  cep: string;
}

export interface UsuarioUpdatePayload {
  nome: string;
  email: string;
  senha?: string | null;
  telefone?: string | null;
}

export interface UsuarioResponsePayload {
  id: number;
  nome: string;
  email: string;
  telefone?: string | null;
  endereco?: Endereco | null;
  token?: string;
}

// ===== Hook =====
export function useUsuario() {
  const queryClient = useQueryClient();
  const { userData } = useAuth();

  const {
    data: usuario,
    isLoading,
    error,
    refetch,
  } = useQuery<UsuarioResponsePayload | null>({
    queryKey: ['usuario', userData?.id],
    queryFn: async () => {
      if (!userData?.id) return null;
      const { data } = await api.get<UsuarioResponsePayload>(`/usuarios/${userData.id}`);
      return data;
    },
    enabled: Boolean(userData?.id),
  });

  const updateMutation = useMutation({
    mutationFn: async (payload: UsuarioUpdatePayload) => {
      const { data } = await api.put<UsuarioResponsePayload>(
        `/usuarios/${userData?.id}`,
        payload
      );
      return data;
    },
    onSuccess: (data) => {
      queryClient.setQueryData(['usuario', userData?.id], data);
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