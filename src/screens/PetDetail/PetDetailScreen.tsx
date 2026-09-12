import React, { useCallback } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { FamilyStackParamList } from '../../routes/types';
import { useSession } from '../../hooks/useSession';
import { usePetDetail } from '../../hooks/usePetDetail';
import { LoadingSpinner } from '../../components/LoadingSpinner';
import { PetAvatarCarousel } from './components/PetAvatarCarousel';
import { PetHeaderCard } from './components/PetHeaderCard';
import { PetPointsCard } from './components/PetPointsCard';
import { PetHistorySection } from './components/PetHistorySection';
import { PetDetailHeader } from './components/PetDetailHeader';
import { PetEmptyState } from './components/PetEmptyState';
import { PetCaregiversSection } from './components/PetCaregiversSection';
import { PetDetailModals } from './components/PetDetailModals';

type PetDetailScreenProps = NativeStackScreenProps<FamilyStackParamList, 'PetDetail'>;

export default function PetDetailScreen({ route, navigation }: PetDetailScreenProps) {
  const routePetId = route?.params?.petId;
  const { user } = useSession();

  const handleGoBack = useCallback(() => {
    navigation.navigate('FamilyMain');
  }, [navigation]);

  const petDetail = usePetDetail(routePetId, handleGoBack);
  const { status, pet, modals, actions } = petDetail;

  if (status.isLoading) {
    return <LoadingSpinner message="Carregando perfil do pet..." />;
  }

  if ((pet?.list?.length ?? 0) === 0) {
    return (
      <View style={styles.container}>
        <PetDetailHeader onGoBack={handleGoBack} subtitle="Prontuário & Histórico de Cuidados" />
        <PetEmptyState />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={{ paddingBottom: 120 }} showsVerticalScrollIndicator={false}>
        <PetDetailHeader onGoBack={handleGoBack} />

        {/* Carrossel de seleção do Pet */}
        <PetAvatarCarousel
          pets={pet?.list ?? []}
          selectedPetId={pet?.active?.id}
          onSelectPet={pet.select}
        />

        {pet?.active && (
          <View style={styles.contentPadding}>
            {/* Card Principal do Perfil do Pet */}
            <PetHeaderCard
              pet={pet.active}
              isResponsavelPrincipal={Boolean(pet?.isPrincipal)}
              onEdit={modals.abrirEdicao}
              onDelete={actions.excluirPet}
            />

            {/* Card de Pontuação do Pet */}
            <PetPointsCard
              pontos={pet?.pontos}
              isLoading={status.isLoadingPontos}
            />

            {/* Rede de Cuidado / Cuidadores do Pet */}
            <PetCaregiversSection
              pet={pet}
              user={user}
              onInvite={() => modals.setConviteVisivel(true)}
            />

            {/* Prontuário de Saúde & Eventos Clínicos (CRUD /historicos) */}
            <PetHistorySection
              type="health"
              items={pet?.historicos ?? []}
              isLoading={status.isLoadingHistoricos}
              onAdd={modals.abrirNovoHistorico}
              onEdit={modals.abrirEdicaoHistorico}
              onDelete={modals.excluirHistorico}
            />

            {/* Histórico Consolidado de Rotina e Cuidados */}
            <PetHistorySection
              type="routine"
              items={pet?.historyData?.tarefasConcluidas ?? []}
              isLoading={status.isLoadingHistory}
            />
          </View>
        )}
      </ScrollView>

      {/* Modais de Gestão do Pet, Cuidadores e Histórico */}
      <PetDetailModals petDetail={petDetail} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  contentPadding: {
    paddingHorizontal: 20,
    paddingTop: 16,
    gap: 16,
  },
});
