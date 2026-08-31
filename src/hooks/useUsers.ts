import { useMutation, useQueryClient } from '@tanstack/react-query';
import { UserService } from '../services/users';
import { StorageService } from '../services/storage';
import { UsuarioRequest } from '../types/user';
import { useSession } from './useSession';

export function useUpdateUser() {
  const queryClient = useQueryClient();
  const { setUser } = useSession();

  return useMutation({
    mutationFn: async ({ id, data }: { id: number; data: UsuarioRequest }) => {
      const updatedUser = await UserService.updateUsuario(id, data);
      await StorageService.saveUser(updatedUser);
      setUser(updatedUser);
      return updatedUser;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['usuario', data.id] });
      queryClient.invalidateQueries({ queryKey: ['rede-cuidado', data.id] });
    },
  });
}

export function useDeleteUser() {
  const { logout } = useSession();

  return useMutation({
    mutationFn: async (id: number) => {
      await UserService.deleteUsuario(id);
      await logout();
    },
  });
}
