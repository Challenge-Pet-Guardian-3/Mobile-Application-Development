import { QueryClient } from '@tanstack/react-query';
import axios from 'axios';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 2, // 2 minutos
      gcTime: 1000 * 60 * 15, // 15 minutos (antigo cacheTime)
      retry: (failureCount, error: unknown) => {
        // Não tentar novamente se for erro 404, 401 ou 403
        const status = axios.isAxiosError(error) ? error.response?.status : undefined;
        if (status === 404 || status === 401 || status === 403) {
          return false;
        }
        return failureCount < 2;
      },
      refetchOnWindowFocus: false,
      refetchOnReconnect: true,
    },
    mutations: {
      retry: false,
    },
  },
});
