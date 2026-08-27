import { useQuery } from '@tanstack/react-query';
import { UserService } from '../services/users';
import { queryKeys } from '../lib/queryKeys';

export function useRedeCuidado(usuarioId?: number) {
  return useQuery({
    queryKey: usuarioId ? queryKeys.users.redeCuidado(usuarioId) : ['users', 'redeCuidado', 'null'],
    queryFn: () => (usuarioId ? UserService.getRedeCuidado(usuarioId) : Promise.reject('Usuario ID nulo')),
    enabled: !!usuarioId,
  });
}
