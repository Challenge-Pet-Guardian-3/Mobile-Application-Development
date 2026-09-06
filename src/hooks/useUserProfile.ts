import { useState, useCallback, useMemo } from 'react';
import { Alert } from 'react-native';
import { useSession } from './useSession';
import { useUserPoints } from './useTasks';
import { useRedeCuidado } from './useRedeCuidado';
import { useUpdateUser, useDeleteUser } from './useUsers';
import { EditProfileFormData } from '../components/EditProfileModal';
import { ProfileEditSchema, formatZodError } from '../utils/schemas';
import { getApiErrorMessage } from '../utils/apiError';

export type UserProfileModal = 'editar' | 'faq' | 'termos' | null;

export function useUserProfile() {
  const { user, logout } = useSession();
  const { data: pontosTotais } = useUserPoints(user?.id);
  const { data: redeCuidado } = useRedeCuidado(user?.id);

  const updateUserMutation = useUpdateUser();
  const deleteUserMutation = useDeleteUser();

  const [modalAtivo, setModalAtivo] = useState<UserProfileModal>(null);

  const abrirModal = useCallback((tipo: 'editar' | 'faq' | 'termos') => {
    setModalAtivo(tipo);
  }, []);

  const fecharModal = useCallback(() => {
    setModalAtivo(null);
  }, []);

  const initials = useMemo(() => {
    return (user?.nome || 'TU').substring(0, 2).toUpperCase();
  }, [user?.nome]);

  const enderecoPrincipal = useMemo(() => {
    return user?.enderecos?.[0] ?? null;
  }, [user?.enderecos]);

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
            fecharModal();
          },
          onError: (err) => {
            Alert.alert('Erro ao Atualizar Perfil', getApiErrorMessage(err, 'Não foi possível atualizar seus dados na API.'));
          },
        }
      );
    },
    [user, updateUserMutation, fecharModal]
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
              onError: (err) => {
                Alert.alert('Erro ao Excluir Conta', getApiErrorMessage(err, 'Não foi possível excluir a conta.'));
              },
            });
          },
        },
      ]
    );
  }, [user, deleteUserMutation]);

  return {
    profile: {
      user,
      initials,
      enderecoPrincipal,
      pontosTotais,
      redeCuidado,
    },
    modals: {
      ativo: modalAtivo,
      abrir: abrirModal,
      fechar: fecharModal,
      initialFormData,
    },
    actions: {
      salvarPerfil,
      logout: logoutComConfirmacao,
      excluirConta: excluirContaComConfirmacao,
      isUpdating: updateUserMutation.isPending,
    },
  };
}
