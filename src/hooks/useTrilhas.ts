import { useMemo } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '../services/api';
import { useAuth } from '../contexts/AuthContext';

export interface EtapaConcluidaBackend {
  id: number;
  etapaId: string;
  tipo: string;
  xpGanho: number;
  dataConclusao: string;
}

interface ConcluirEtapaPayload {
  etapaId: string;
  tipo: string;
  xp: number;
}

export function useTrilhas(habilitado: boolean = true) {
  const queryClient = useQueryClient();
  const { userData } = useAuth();
  const usuarioId = userData?.id;

  const { data: concluidas = [], isLoading } = useQuery({
    queryKey: ['trilhas-concluidas', usuarioId],
    queryFn: async () => {
      // GET /trilhas/concluidas agora deriva o usuário do JWT (Authentication) —
      // não precisa mais mandar usuarioId como query param.
      const { data } = await api.get<EtapaConcluidaBackend[]>('/trilhas/concluidas');
      return data;
    },
    enabled: Boolean(usuarioId) && habilitado,
  });

  const etapasConcluidasIds = useMemo(
    () => new Set(concluidas.map((e) => e.etapaId)),
    [concluidas]
  );

  // Soma o XP já conquistado nas trilhas — independe de ter família ou não.
  const xpTrilhas = useMemo(
    () => concluidas.reduce((acc, e) => acc + (e.xpGanho || 0), 0),
    [concluidas]
  );

  const concluirEtapaMutation = useMutation({
    mutationFn: async ({ etapaId, tipo, xp }: ConcluirEtapaPayload) => {
      // TrilhaConclusaoRequest só tem etapaId/tipo/xp — não ignora campos
      // desconhecidos, então NUNCA mandar usuarioId aqui (o backend pega do JWT).
      const { data } = await api.post<EtapaConcluidaBackend>('/trilhas/concluir', {
        etapaId,
        tipo,
        xp,
      });
      return data;
    },
    onSuccess: () => {
      // Atualiza a lista de concluídas E o XP que Home/Perfil leem.
      queryClient.invalidateQueries({ queryKey: ['trilhas-concluidas', usuarioId] });
      queryClient.invalidateQueries({ queryKey: ['familia', usuarioId] });
      queryClient.invalidateQueries({ queryKey: ['pontos-usuario', usuarioId] });
    },
  });

  return {
    isLoading,
    etapasConcluidasIds,
    xpTrilhas,
    concluirEtapa: concluirEtapaMutation.mutateAsync,
    concluindoEtapa: concluirEtapaMutation.isPending,
  };
}