// src/hooks/useClinics.ts
import { useEffect, useState } from 'react';
import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { api } from '../services/api';

export interface ClinicaResponse {
  id: number;
  nome: string;
  rua: string;
  numero: string;
  bairro: string;
  distanciaKm: number;
  telefone: string;
  avaliacao: number;
  atendimento24h: boolean;
  prontoSocorro: boolean;
  especialidades: string[];
  patrocinada?: boolean;
}

interface UseClinicsParams {
  termoBusca: string;
  somente24h: boolean;
  somenteProntoSocorro: boolean;
}

const DEBOUNCE_MS = 400;

// Espera o usuário parar de digitar antes de repassar o valor,
// evitando disparar uma requisição a cada tecla pressionada.
function useDebouncedValue<T>(valor: T, delayMs: number): T {
  const [valorDebounced, setValorDebounced] = useState(valor);

  useEffect(() => {
    const timeoutId = setTimeout(() => setValorDebounced(valor), delayMs);
    return () => clearTimeout(timeoutId);
  }, [valor, delayMs]);

  return valorDebounced;
}

export function useClinics({ termoBusca, somente24h, somenteProntoSocorro }: UseClinicsParams) {
  const termoBuscaDebounced = useDebouncedValue(termoBusca.trim(), DEBOUNCE_MS);

  return useQuery<ClinicaResponse[]>({
    queryKey: ['clinicas', termoBuscaDebounced, somente24h, somenteProntoSocorro],
    queryFn: async () => {
      const { data } = await api.get<ClinicaResponse[]>('/clinicas', {
        params: {
          busca: termoBuscaDebounced || undefined,
          atendimento24h: somente24h || undefined,
          prontoSocorro: somenteProntoSocorro || undefined,
        },
      });
      return data;
    },
    // Mantém os resultados anteriores visíveis enquanto a nova busca carrega,
    // em vez de piscar para o estado de loading a cada letra digitada.
    placeholderData: keepPreviousData,
  });
}