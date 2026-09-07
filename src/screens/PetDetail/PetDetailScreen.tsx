import React, { useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Platform,
  TouchableOpacity,
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { Header } from '../../components/Header';
import { PetAvatarCarousel } from '../../components/PetAvatarCarousel';
import { PetHeaderCard } from '../../components/PetHeaderCard';
import { PetPointsCard } from '../../components/PetPointsCard';
import { CaregiverCard } from '../../components/CaregiverCard';
import { PetHistoryList } from '../../components/PetHistoryList';
import { PetHealthHistoryList } from '../../components/PetHealthHistoryList';
import { PetFormModal } from '../../components/PetFormModal';
import { InviteCaregiverModal } from '../../components/InviteCaregiverModal';
import { HistoricoFormModal } from '../../components/HistoricoFormModal';
import { LoadingSpinner } from '../../components/LoadingSpinner';
import { shadows } from '../../utils/shadow';
import { useSession } from '../../hooks/useSession';
import { usePetDetail } from '../../hooks/usePetDetail';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { FamilyStackParamList } from '../../routes/types';

type PetDetailScreenProps = NativeStackScreenProps<FamilyStackParamList, 'PetDetail'>;

export default function PetDetailScreen({ route, navigation }: PetDetailScreenProps) {
  const routePetId = route?.params?.petId;
  const { user } = useSession();

  const handleGoBack = useCallback(() => {
    navigation.navigate('FamilyMain');
  }, [navigation]);

  const { status, pet, modals, actions } = usePetDetail(routePetId, handleGoBack);

  if (status.isLoading) {
    return <LoadingSpinner message="Carregando perfil do pet..." />;
  }

  if (pet.list.length === 0) {
    return (
      <View style={styles.container}>
        <View style={styles.paddingHeader}>
          <TouchableOpacity onPress={handleGoBack} style={styles.btnVoltarTop} activeOpacity={0.7}>
            <Ionicons name="arrow-back" size={18} color="#1E293B" />
            <Text style={styles.btnVoltarText}>Voltar</Text>
          </TouchableOpacity>
          <Header subtitle="Prontuário & Histórico de Cuidados" />
        </View>
        <View style={styles.emptyContainerCenter}>
          <MaterialCommunityIcons name="paw-off" size={48} color="#94A3B8" />
          <Text style={styles.emptyTitle}>Nenhum pet encontrado</Text>
          <Text style={styles.emptySub}>
            Vá até a aba Family Pet para cadastrar o primeiro membro.
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={{ paddingBottom: 120 }} showsVerticalScrollIndicator={false}>
        <View style={styles.paddingHeader}>
          <TouchableOpacity onPress={handleGoBack} style={styles.btnVoltarTop} activeOpacity={0.7}>
            <Ionicons name="arrow-back" size={18} color="#1E293B" />
            <Text style={styles.btnVoltarText}>Voltar</Text>
          </TouchableOpacity>
          <Header subtitle="Ficha Completa & Histórico de Cuidados" />
        </View>

        {/* Carrossel de seleção do Pet */}
        <PetAvatarCarousel
          pets={pet.list}
          selectedPetId={pet.active?.id}
          onSelectPet={pet.select}
        />

        {pet.active && (
          <View style={styles.contentPadding}>
            {/* Card Principal do Perfil do Pet */}
            <PetHeaderCard
              pet={pet.active}
              isResponsavelPrincipal={pet.isPrincipal}
              onEdit={modals.abrirEdicao}
              onDelete={actions.excluirPet}
            />

            {/* Card de Pontuação do Pet */}
            <PetPointsCard
              pontos={pet.pontos}
              isLoading={status.isLoadingPontos}
            />

            {/* Rede de Cuidado / Cuidadores do Pet */}
            <View style={styles.sectionBox}>
              <View style={styles.sectionHeader}>
                <View style={styles.sectionTitleRow}>
                  <Ionicons name="people" size={18} color="#2563EB" />
                  <Text style={styles.sectionTitle}>
                    Rede de Cuidado ({pet.caregiversCount})
                  </Text>
                </View>
                {pet.isPrincipal && (
                  <TouchableOpacity
                    style={styles.btnInvite}
                    onPress={() => modals.setConviteVisivel(true)}
                    activeOpacity={0.7}
                  >
                    <Ionicons name="person-add" size={13} color="#2563EB" />
                    <Text style={styles.btnInviteText}>Convidar</Text>
                  </TouchableOpacity>
                )}
              </View>

              {pet.caregivers.length === 0 ? (
                user && (
                  <CaregiverCard
                    nome={user.nome || 'Tutor'}
                    email={user.email}
                    roleText="Responsável Principal"
                    isCurrentUser
                    isPrincipal
                  />
                )
              ) : (
                pet.caregivers.map((c) => (
                  <CaregiverCard
                    key={c.usuarioId}
                    nome={c.nome}
                    email={c.email}
                    isPrincipal={c.responsavelPrincipal}
                    isCurrentUser={c.isCurrentUser}
                    onTransfer={c.onTransfer}
                    onRemove={c.onRemove}
                  />
                ))
              )}
            </View>

            {/* Prontuário de Saúde & Eventos Clínicos (CRUD /historicos) */}
            <PetHealthHistoryList
              historicos={pet.historicos}
              isLoading={status.isLoadingHistoricos}
              onAdd={modals.abrirNovoHistorico}
              onEdit={modals.abrirEdicaoHistorico}
              onDelete={modals.excluirHistorico}
            />

            {/* Histórico Consolidado de Rotina e Cuidados */}
            <PetHistoryList
              historico={pet.historyData?.tarefasConcluidas || []}
              isLoading={status.isLoadingHistory}
            />
          </View>
        )}
      </ScrollView>

      {/* Modal de Edição de Ficha do Pet Reutilizável */}
      <PetFormModal
        visible={modals.edicaoVisivel}
        onClose={() => modals.setEdicaoVisivel(false)}
        mode="edit"
        title={pet.editTitle}
        subtitle="Atualize os dados e informações cadastrais do animal"
        initialData={pet.initialData}
        isLoading={actions.isUpdatingPet}
        onSubmit={modals.salvarEdicao}
      />

      {/* Modal de Convidar Cuidador para o Pet */}
      <InviteCaregiverModal
        visible={modals.conviteVisivel}
        onClose={() => modals.setConviteVisivel(false)}
        pets={pet.active ? [pet.active] : pet.list}
        initialPetId={pet.active?.id}
        isLoading={actions.isInvitingCaregiver}
        onSubmit={modals.convidarCuidador}
      />

      {/* Modal de CRUD de Registro de Saúde / Histórico */}
      {pet.active && (
        <HistoricoFormModal
          visible={modals.historicoVisivel}
          onClose={() => modals.setHistoricoVisivel(false)}
          mode={modals.itemEdicaoHistorico ? 'edit' : 'create'}
          petId={pet.active.id}
          initialData={modals.itemEdicaoHistorico}
          isLoading={actions.isSavingHistorico}
          onSubmit={modals.salvarHistorico}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  paddingHeader: {
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'ios' ? 50 : 25,
  },
  btnVoltarTop: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: 6,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 8,
  },
  btnVoltarText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1E293B',
  },
  emptyContainerCenter: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#1E293B',
    marginTop: 12,
  },
  emptySub: {
    fontSize: 13,
    color: '#64748B',
    textAlign: 'center',
    marginTop: 4,
  },
  contentPadding: {
    paddingHorizontal: 20,
    paddingTop: 16,
    gap: 16,
  },
  sectionBox: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(226, 232, 240, 0.8)',
    ...shadows.sm,
    elevation: 2,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  sectionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0F172A',
  },
  btnInvite: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EFF6FF',
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 10,
    gap: 4,
  },
  btnInviteText: {
    color: '#2563EB',
    fontWeight: '800',
    fontSize: 11,
  },
});
