import { QueryClient } from '@tanstack/react-query';
import { normalizeHttpError } from '../utils/apiError';

function shouldRetry(failureCount: number, error: unknown, maxRetries: number): boolean {
  const normalized = normalizeHttpError(error);
  const status = normalized.status;

  // Não retentar erros determinísticos de cliente (validação, autenticação ou recurso inexistente)
  if (status === 400 || status === 401 || status === 403 || status === 404 || status === 422) {
    return false;
  }

  // Permite retentativas em falhas transitórias (502, 503, 504, timeout, rede)
  return failureCount < maxRetries;
}

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 2, // 2 minutos
      gcTime: 1000 * 60 * 15, // 15 minutos
      retry: (failureCount, error: unknown) => shouldRetry(failureCount, error, 2),
      retryDelay: (attemptIndex) => Math.min(1000 * Math.pow(2, attemptIndex), 8000),
      refetchOnWindowFocus: false,
      refetchOnReconnect: true,
    },
    mutations: {
      // Tolera 1 retentativa rápida para cold starts ou intermitência de rede
      retry: (failureCount, error: unknown) => shouldRetry(failureCount, error, 1),
      retryDelay: 2000,
    },
  },
});
