import React from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Platform,
  RefreshControl,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Header } from '../../components/Header';
import { FaqModal } from './components/FaqModal';
import { TermsModal } from './components/TermsModal';
import { EditProfileModal } from '../../components/EditProfileModal';
import { useUserProfile } from '../../hooks/useUserProfile';
import { RootStackParamList } from '../../routes/types';
import { PerfilUsuarioCard } from './components/PerfilUsuarioCard';
import { EstatisticasPerfil } from './components/EstatisticasPerfil';
import { RedeFamiliarECuidadores } from './components/RedeFamiliarECuidadores';
import { RecursosPetGuardian } from './components/RecursosPetGuardian';
import { ContaESuporte } from './components/ContaESuporte';

interface UserProfileScreenProps {
  navigation: NativeStackNavigationProp<RootStackParamList>;
}

export default function UserProfileScreen({ navigation }: UserProfileScreenProps) {
  const { status, profile, modals, actions } = useUserProfile();

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={status.isFetching && !status.isLoading}
            onRefresh={actions.refetch}
            tintColor="#2563EB"
          />
        }
      >
        <Header subtitle="Meu Perfil & Configurações" />

        {/* Card Principal do Usuário */}
        <PerfilUsuarioCard
          profile={profile}
          onEdit={() => modals.abrir('editar')}
        />

        {/* Estatísticas Gamificadas */}
        <EstatisticasPerfil profile={profile} />

        {/* Rede Familiar & Cuidadores */}
        <RedeFamiliarECuidadores profile={profile} navigation={navigation} />

        {/* Recursos & Ferramentas do Ecossistema */}
        <RecursosPetGuardian navigation={navigation} />

        {/* Conta, FAQ, Termos e Logout */}
        <ContaESuporte
          onOpenFaq={() => modals.abrir('faq')}
          onOpenTerms={() => modals.abrir('termos')}
          onLogout={actions.logout}
        />

        <View style={{ height: 110 }} />
      </ScrollView>

      {/* Modais de Suporte e Edição de Perfil */}
      <EditProfileModal
        visible={modals.ativo === 'editar'}
        onClose={modals.fechar}
        initialData={modals.initialFormData}
        isLoading={actions.isUpdating}
        onSubmit={actions.salvarPerfil}
      />

      <FaqModal visible={modals.ativo === 'faq'} onClose={modals.fechar} />

      <TermsModal visible={modals.ativo === 'termos'} onClose={modals.fechar} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    paddingTop: Platform.OS === 'ios' ? 50 : 25,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 10,
    gap: 16,
  },
});