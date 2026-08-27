import { useMutation, useQueryClient } from '@tanstack/react-query';
import { UserService } from '../services/users';
import { UsuarioRequest, UsuarioResponse } from '../types/user';
import { useSession } from './useSession';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { STORAGE_KEYS } from '../constants/Keys';

export function useUpdateUser() {
  const queryClient = useQueryClient();
  const { setUser } = useSession();

  return useMutation({
    mutationFn: async ({ id, data }: { id: number; data: UsuarioRequest }) => {
      const updatedUser = await UserService.updateUsuario(id, data);
      await AsyncStorage.setItem(STORAGE_KEYS.AUTH_USER, JSON.stringify(updatedUser));
      await AsyncStorage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(updatedUser));
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
