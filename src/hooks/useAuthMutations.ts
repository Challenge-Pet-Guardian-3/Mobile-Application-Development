import { useMutation, useQueryClient } from '@tanstack/react-query';
import { AuthService } from '../services/auth';
import { useSession } from './useSession';
import { LoginCredentials, RegisterCredentials } from '../types/auth';

export { getAuthErrorMessage } from '../utils/apiError';

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
