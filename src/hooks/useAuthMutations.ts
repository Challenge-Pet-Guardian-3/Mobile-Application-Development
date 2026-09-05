import { useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { AuthService } from '../services/auth';
import { useSession } from './useSession';
import { LoginCredentials, RegisterCredentials } from '../types/auth';

export function getAuthErrorMessage(error: unknown, defaultMessage = 'Falha na comunicação com o servidor.'): string {
  if (axios.isAxiosError(error)) {
    const status = error.response?.status;
    if (status === 401) {
      return 'E-mail ou senha incorretos.';
    }
    const data = error.response?.data;
    if (data?.erros && Array.isArray(data.erros) && data.erros.length > 0) {
      return data.erros
        .map((e: { campo?: string; mensagem?: string }) => e.mensagem || `${e.campo}: valor inválido`)
        .join('\n');
    }
    const backendMsg = data?.mensagem || data?.message;
    if (typeof backendMsg === 'string' && backendMsg.trim().length > 0) {
      return backendMsg;
    }
    if (status && status >= 500) {
      return 'Serviço temporariamente indisponível. Tente novamente mais tarde.';
    }
    return error.message || defaultMessage;
  }
  if (error instanceof Error) {
    return error.message;
  }
  return defaultMessage;
}

export function useLoginMutation() {
  const queryClient = useQueryClient();
  const { setSession } = useSession();

  return useMutation({
    mutationFn: (credentials: LoginCredentials) => AuthService.login(credentials),
    onSuccess: (data) => {
      setSession(data);
      queryClient.invalidateQueries();
    },
  });
}

export function useRegisterMutation() {
  const queryClient = useQueryClient();
  const { setSession } = useSession();

  return useMutation({
    mutationFn: async (credentials: RegisterCredentials) => {
      await AuthService.register(credentials);
      return AuthService.login({
        email: credentials.email,
        senha: credentials.senha,
      });
    },
    onSuccess: (data) => {
      setSession(data);
      queryClient.invalidateQueries();
    },
  });
}
