import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { Cuidador, Recado } from '../types/models';

export interface MembroBackend {
  id: number;
  usuarioId: number;
  nome: string;
  funcao: string;
  xp: number;
  responsavelPrincipal: boolean;
}

export interface RecadoBackend {
  id: number;
  texto: string;
  autor: string;
  dataHora: string;
  editado: boolean;
}

export interface FamiliaBackend {
  id: number;
  nome: string;
  codigoConvite: string;
  xpTotal: number;
  membros: MembroBackend[];
  recados: RecadoBackend[];
}

export interface FamiliaInfo {
  id: number | null;
  nome: string;
  codigoConvite: string;
  ativa: boolean;
  souDono: boolean;
  cuidadores: Cuidador[];
  recados: Recado[];
}

const familiaVazia: FamiliaInfo = {
  id: null,
  nome: '',
  codigoConvite: '',
  ativa: false,
  souDono: false,
  cuidadores: [],
  recados: [],
};

const mapFamilia = (data: FamiliaBackend, usuarioId?: number): FamiliaInfo => ({
  id: data.id,
  nome: data.nome,
  codigoConvite: data.codigoConvite,
  ativa: true,
  souDono: data.membros.some((m) => m.usuarioId === usuarioId && m.responsavelPrincipal),
  cuidadores: data.membros.map((m) => ({
    id: String(m.id),
    nome: m.usuarioId === usuarioId ? `${m.nome} (Você)` : m.nome,
    funcao: m.funcao,
    xp: m.xp,
  })),
  recados: data.recados.map((r) => ({
    id: String(r.id),
    texto: r.texto,
    hora: r.editado
      ? `${new Date(r.dataHora).toLocaleString('pt-BR')} (editado)`
      : new Date(r.dataHora).toLocaleString('pt-BR'),
    autor: r.autor,
  })),
});

const fetchFamiliaData = async (usuarioId?: number): Promise<FamiliaInfo> => {
  try {
    const { data } = await api.get<FamiliaBackend>('/familia');
    return mapFamilia(data, usuarioId);
  } catch (error: any) {
    if (error.response?.status === 404) {
      return familiaVazia;
    }
    throw error;
  }
};

export function useFamily() {
  const queryClient = useQueryClient();
  const { userData } = useAuth();
  const usuarioId = userData?.id;

  const {
    data: familia = familiaVazia,
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ['familia', usuarioId],
    queryFn: () => fetchFamiliaData(usuarioId),
    enabled: Boolean(usuarioId),
  });

  const invalidar = () => queryClient.invalidateQueries({ queryKey: ['familia', usuarioId] });

  const criarFamiliaMutation = useMutation({
    mutationFn: async (nomeFamilia: string) => {
      const { data } = await api.post<FamiliaBackend>('/familia', { nome: nomeFamilia.trim() });
      return data;
    },
    onSuccess: invalidar,
  });

  const entrarFamiliaMutation = useMutation({
    mutationFn: async ({ codigo, funcao }: { codigo: string; funcao: string }) => {
      const { data } = await api.post<FamiliaBackend>('/familia/entrar', {
        codigo: codigo.trim().toUpperCase(),
        funcao: funcao.trim() || 'Co-cuidador',
      });
      return data;
    },
    onSuccess: invalidar,
  });

  const sairFamiliaMutation = useMutation({
    mutationFn: async () => {
      await api.post('/familia/sair');
    },
    onSuccess: invalidar,
  });

  const removerMembroMutation = useMutation({
    mutationFn: async (membroId: string) => {
      await api.delete(`/familia/membros/${membroId}`);
    },
    onSuccess: invalidar,
  });

  const renomearFamiliaMutation = useMutation({
    mutationFn: async (novoNome: string) => {
      const { data } = await api.put<FamiliaBackend>('/familia', { nome: novoNome.trim() });
      return data;
    },
    onSuccess: invalidar,
  });

  const salvarRecadoMutation = useMutation({
    mutationFn: async ({ id, texto }: { id?: string | null; texto: string }) => {
      if (id) {
        const { data } = await api.put(`/familia/recados/${id}`, { texto });
        return data;
      }
      const { data } = await api.post('/familia/recados', { texto });
      return data;
    },
    onSuccess: invalidar,
  });

  const excluirRecadoMutation = useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/familia/recados/${id}`);
    },
    onSuccess: invalidar,
  });

  return {
    familia,
    isLoading,
    refetch,
    criarFamilia: criarFamiliaMutation.mutateAsync,
    entrarFamilia: entrarFamiliaMutation.mutateAsync,
    sairFamilia: sairFamiliaMutation.mutateAsync,
    removerMembro: removerMembroMutation.mutateAsync,
    salvarRecado: salvarRecadoMutation.mutateAsync,
    excluirRecado: excluirRecadoMutation.mutateAsync,
    renomearFamilia: renomearFamiliaMutation.mutateAsync,
    isProcessing:
      criarFamiliaMutation.isPending ||
      entrarFamiliaMutation.isPending ||
      sairFamiliaMutation.isPending ||
      removerMembroMutation.isPending ||
      salvarRecadoMutation.isPending ||
      excluirRecadoMutation.isPending ||
      renomearFamiliaMutation.isPending,
  };
}