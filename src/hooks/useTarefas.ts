import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '../services/api';
import { useAuth } from '../contexts/AuthContext';

export interface TarefaBackend {
  id: number;
  titulo: string;
  descricao?: string;
  horario?: string;
  prazo?: string | null;
  xp?: number;
  pontosTarefa?: number;
  status?: string;
  concluida?: boolean;
  expirada?: boolean;
  petId?: number;
  usuarioId?: number | null;
  pet?: any;
  usuario?: any;
}

export interface CriarTarefaPayload {
  titulo: string;
  descricao?: string;
  petId: number;
  prazo?: string;
  pontosTarefa?: number;
}

export interface AtualizarTarefaPayload {
  id: number;
  titulo: string;
  descricao?: string;
  petId: number;
  pontosTarefa?: number;
  prazo?: string;
  status?: string;
}

const getPrazoHojeIso = (): string => {
  const agora = new Date();
  const ano = agora.getFullYear();
  const mes = String(agora.getMonth() + 1).padStart(2, '0');
  const dia = String(agora.getDate()).padStart(2, '0');
  return `${ano}-${mes}-${dia}T23:59:59`;
};

const fetchTarefas = async (usuarioId?: number): Promise<TarefaBackend[]> => {
  const { data } = await api.get('/tarefas', {
    params: {
      usuarioId,
      size: 200,
    },
  });
  const lista: any[] = Array.isArray(data) ? data : data.content || [];

  return lista.map((t) => {
    const statusBackend = t.status ?? (t.concluida ? 'CONCLUIDO' : 'PENDENTE');
    const isConcluida = statusBackend === 'CONCLUIDO';
    const isExpirada = statusBackend === 'EXPIRADO';
    const usuarioExecutorId = t.usuarioId ?? t.usuario?.id ?? null;

    return {
      ...t,
      usuarioId: usuarioExecutorId,
      concluida: isConcluida,
      expirada: isExpirada,
      status: statusBackend,
      horario: isExpirada ? 'Expirada' : 'Hoje',
      xp: t.pontosTarefa ?? t.xp ?? 15,
      pontosTarefa: t.pontosTarefa ?? t.xp ?? 15,
    };
  });
};

export function useTarefas() {
  const queryClient = useQueryClient();
  const { userData } = useAuth();

  const {
    data: tarefas = [],
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: ['tarefas', userData?.id],
    queryFn: () => fetchTarefas(userData?.id),
    enabled: Boolean(userData?.id),
  });

  const createTarefaMutation = useMutation({
    mutationFn: async (payload: CriarTarefaPayload) => {
      const corpoRequisicao = {
        titulo: payload.titulo.trim(),
        descricao: payload.descricao?.trim() || 'Sem descrição',
        pontosTarefa: payload.pontosTarefa || 15,
        prazo: payload.prazo || getPrazoHojeIso(),
        status: 'PENDENTE',
        petId: Number(payload.petId),
        usuarioId: null,
      };
      const { data } = await api.post<TarefaBackend>('/tarefas', corpoRequisicao);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tarefas', userData?.id] });
    },
  });

  const updateTarefaMutation = useMutation({
    mutationFn: async (payload: AtualizarTarefaPayload) => {
      const corpoRequisicao = {
        titulo: payload.titulo.trim(),
        descricao: payload.descricao?.trim() || 'Sem descrição',
        pontosTarefa: payload.pontosTarefa || 15,
        prazo: payload.prazo || getPrazoHojeIso(),
        status: payload.status || 'PENDENTE',
        petId: Number(payload.petId),
        usuarioId: null,
      };
      const { data } = await api.put<TarefaBackend>(`/tarefas/${payload.id}`, corpoRequisicao);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tarefas', userData?.id] });
    },
  });

  const alternarStatusMutation = useMutation({
    mutationFn: async ({ id, concluida }: { id: number; concluida: boolean }) => {
      if (!concluida) {
        const payloadConclusao = { concluinteId: Number(userData?.id || 1) };
        const { data } = await api.patch<TarefaBackend>(`/tarefas/${id}/concluir`, payloadConclusao);
        return data;
      } else {
        const { data } = await api.patch<TarefaBackend>(
          `/tarefas/${id}/reabrir`, 
          null, 
          { params: { solicitanteId: userData?.id } }
        );
        return data;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tarefas', userData?.id] });
      queryClient.invalidateQueries({ queryKey: ['familia'] });
      queryClient.invalidateQueries({ queryKey: ['pontos-usuario', userData?.id] });
    },
  });

  const deleteTarefaMutation = useMutation({
    mutationFn: async (id: number) => {
      await api.delete(`/tarefas/${id}`, {
        params: { solicitanteId: userData?.id }
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tarefas', userData?.id] });
      queryClient.invalidateQueries({ queryKey: ['familia'] });
      queryClient.invalidateQueries({ queryKey: ['pontos-usuario', userData?.id] });
    },
  });

  return {
    tarefas,
    isLoading,
    isError,
    error,
    refetch,
    criarTarefa: createTarefaMutation.mutateAsync,
    atualizarTarefa: updateTarefaMutation.mutateAsync,
    alternarStatus: alternarStatusMutation.mutateAsync,
    concluirTarefa: alternarStatusMutation.mutateAsync,
    excluirTarefa: deleteTarefaMutation.mutateAsync,
    isCriando: createTarefaMutation.isPending,
    isAtualizando: updateTarefaMutation.isPending,
    isAlternando: alternarStatusMutation.isPending,
    isExcluindo: deleteTarefaMutation.isPending,
  };
}