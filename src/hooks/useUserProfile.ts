import { useCallback, useMemo } from 'react';
import { Alert } from 'react-native';
import { useSession } from './useSession';
import { useUserPoints } from './useTasks';
import { useRedeCuidado } from './useRedeCuidado';
import { useUpdateUser, useDeleteUser } from './useUsers';
import { EditProfileFormData } from '../components/EditProfileModal';
import { ProfileEditSchema, formatZodError } from '../utils/schemas';

export function useUserProfile() {
  const { user, logout } = useSession();
  const { data: pontosTotais } = useUserPoints(user?.id);
  const { data: redeCuidado } = useRedeCuidado(user?.id);

  const updateUserMutation = useUpdateUser();
  const deleteUserMutation = useDeleteUser();

  const initialFormData: EditProfileFormData = useMemo(
    () => ({
      nome: user?.nome ?? '',
      email: user?.email ?? '',
      senha: '',
      ddd: user?.ddd ?? '',
      numeroTelefone: user?.numeroTelefone ?? '',
      role: user?.role ?? 'PREMIUM',
      cep: user?.enderecos?.[0]?.cep ?? '',
      numero: user?.enderecos?.[0]?.numero ?? '',
    }),
    [user]
  );

  const salvarPerfil = useCallback(
    (formEdit: EditProfileFormData, callbacks?: { onSuccess?: () => void }) => {
      if (!user) return;

      const validacao = ProfileEditSchema.safeParse({
        ...formEdit,
        ddd: formEdit.ddd.replace(/\D/g, ''),
        numeroTelefone: formEdit.numeroTelefone.replace(/\D/g, ''),
        cep: formEdit.cep.replace(/\D/g, ''),
      });

      if (!validacao.success) {
        Alert.alert('Dados do Perfil', formatZodError(validacao.error));
        return;
      }

      updateUserMutation.mutate(
        {
          id: user.id,
          data: {
            nome: formEdit.nome.trim(),
            email: formEdit.email.trim().toLowerCase(),
            senha: formEdit.senha?.trim() || '',
            ddd: formEdit.ddd.replace(/\D/g, ''),
            numeroTelefone: formEdit.numeroTelefone.replace(/\D/g, ''),
            role: formEdit.role || 'PREMIUM',
            endereco: {
              cep: formEdit.cep.replace(/\D/g, ''),
              numero: formEdit.numero.trim(),
            },
          },
        },
        {
          onSuccess: () => {
            callbacks?.onSuccess?.();
            Alert.alert('Sucesso!', 'Dados do perfil atualizados com sucesso.');
          },
          onError: () => {
            Alert.alert('Erro', 'Não foi possível atualizar seus dados na API.');
          },
        }
      );
    },
    [user, updateUserMutation]
  );

  const logoutComConfirmacao = useCallback(() => {
    Alert.alert('Sair da Conta', 'Deseja realmente encerrar sua sessão no PetGuardian?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Sair',
        style: 'destructive',
        onPress: async () => {
          await logout();
        },
      },
    ]);
  }, [logout]);

  const excluirContaComConfirmacao = useCallback(() => {
    if (!user) return;
    Alert.alert(
      'Excluir Conta',
      'Tem certeza de que deseja apagar permanentemente sua conta e todos os dados associados? Esta ação não pode ser desfeita.',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Excluir Definitivamente',
          style: 'destructive',
          onPress: () => {
            deleteUserMutation.mutate(user.id, {
              onError: () => {
                Alert.alert('Erro', 'Não foi possível excluir a conta.');
              },
            });
          },
        },
      ]
    );
  }, [user, deleteUserMutation]);

  return {
    user,
    pontosTotais,
    redeCuidado,
    initialFormData,
    salvarPerfil,
    logoutComConfirmacao,
    excluirContaComConfirmacao,
    isUpdating: updateUserMutation.isPending,
    isDeleting: deleteUserMutation.isPending,
  };
}
