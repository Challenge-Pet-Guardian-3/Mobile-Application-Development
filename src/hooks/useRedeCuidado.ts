import { useQuery, skipToken } from '@tanstack/react-query';
import { UserService } from '../services/users';
import { queryKeys } from '../lib/queryKeys';

export function useRedeCuidado(usuarioId?: number) {
  return useQuery({
    queryKey: queryKeys.users.redeCuidado(usuarioId),
    queryFn: usuarioId ? () => UserService.getRedeCuidado(usuarioId) : skipToken,
  });
}
