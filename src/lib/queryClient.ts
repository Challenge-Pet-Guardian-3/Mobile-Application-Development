import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 2, // 2 minutos
      gcTime: 1000 * 60 * 15, // 15 minutos (antigo cacheTime)
      retry: (failureCount, error: any) => {
        // Não tentar novamente se for erro 404 ou 401
        const status = error?.response?.status;
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
