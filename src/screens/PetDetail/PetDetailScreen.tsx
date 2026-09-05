import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Platform,
} from 'react-native';
import { MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
import { Header } from '../../components/Header';
import { LoadingSpinner } from '../../components/LoadingSpinner';
import { PetFormModal, PetFormData } from '../../components/PetFormModal';
import { InviteCaregiverModal, InviteCaregiverData } from '../../components/InviteCaregiverModal';
import { HistoricoFormModal, HistoricoFormSubmitData } from '../../components/HistoricoFormModal';
import { PetAvatarCarousel } from '../../components/PetAvatarCarousel';
import { PetHeaderCard } from '../../components/PetHeaderCard';
import { PetHealthHistoryList } from '../../components/PetHealthHistoryList';
import { PetHistoryList } from '../../components/PetHistoryList';
import { CaregiverCard } from '../../components/CaregiverCard';
import { shadows } from '../../utils/shadow';
import { useSession } from '../../hooks/useSession';
import { usePetDetail } from '../../hooks/usePetDetail';
import { HistoricoResponse } from '../../types/historico';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { FamilyStackParamList } from '../../routes/types';

type PetDetailScreenProps = NativeStackScreenProps<FamilyStackParamList, 'PetDetail'>;

export default function PetDetailScreen({ route, navigation }: PetDetailScreenProps) {
  const routePetId = route?.params?.petId;
  const { user } = useSession();

  const {
    pets,
    activePet,
    setSelectedPetId,
    historyData,
    historicos,
    caregivers,
    isResponsavelPrincipal,
    initialPetData,
    isLoading,
    isLoadingHistory,
    isLoadingHistoricos,
    salvarEdicaoPet,
    excluirPet,
    convidarCuidador,
    removerCuidador,
    transferirResponsabilidade,
    criarHistorico,
    atualizarHistorico,
    excluirHistorico,
    isUpdatingPet,
    isInvitingCaregiver,
    isSavingHistorico,
  } = usePetDetail(routePetId);

  const [modalEdicaoVisivel, setModalEdicaoVisivel] = useState(false);
  const [modalConviteVisivel, setModalConviteVisivel] = useState(false);
  const [modalHistoricoVisivel, setModalHistoricoVisivel] = useState(false);
  const [itemEdicaoHistorico, setItemEdicaoHistorico] = useState<HistoricoResponse | null>(null);

  const abrirEdicao = useCallback(() => {
    if (!activePet) return;
    setModalEdicaoVisivel(true);
  }, [activePet]);

  const handleSalvarEdicao = useCallback(
    (formData: PetFormData) => {
      salvarEdicaoPet(formData, {
        onSuccess: () => setModalEdicaoVisivel(false),
      });
    },
    [salvarEdicaoPet]
  );

  const handleExcluirPet = useCallback(() => {
    excluirPet({
      onSuccess: () => {
        navigation.goBack();
      },
    });
  }, [excluirPet, navigation]);

  const handleConvidarCuidador = useCallback(
    (data: InviteCaregiverData) => {
      convidarCuidador(data.email, {
        onSuccess: () => setModalConviteVisivel(false),
      });
    },
    [convidarCuidador]
  );

  const handleAbrirNovoHistorico = useCallback(() => {
    setItemEdicaoHistorico(null);
    setModalHistoricoVisivel(true);
  }, []);

  const handleAbrirEdicaoHistorico = useCallback((item: HistoricoResponse) => {
    setItemEdicaoHistorico(item);
    setModalHistoricoVisivel(true);
  }, []);

  const handleSalvarHistorico = useCallback(
    (data: HistoricoFormSubmitData) => {
      if (itemEdicaoHistorico) {
        atualizarHistorico(itemEdicaoHistorico.id, data, {
          onSuccess: () => setModalHistoricoVisivel(false),
        });
      } else {
        criarHistorico(data, {
          onSuccess: () => setModalHistoricoVisivel(false),
        });
      }
    },
    [itemEdicaoHistorico, atualizarHistorico, criarHistorico]
  );

  const handleExcluirHistorico = useCallback(
    (item: HistoricoResponse) => {
      excluirHistorico(item.id, item.tipoHist);
    },
    [excluirHistorico]
  );

  const handleGoBack = useCallback(() => {
    navigation.goBack();
  }, [navigation]);

  if (isLoading) {
    return <LoadingSpinner message="Carregando perfil do pet..." />;
  }

  if (pets.length === 0) {
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
          pets={pets}
          selectedPetId={activePet?.id}
          onSelectPet={setSelectedPetId}
        />

        {activePet && (
          <View style={styles.contentPadding}>
            {/* Card Principal do Perfil do Pet */}
            <PetHeaderCard
              pet={activePet}
              onEdit={abrirEdicao}
              onDelete={handleExcluirPet}
            />

            {/* Rede de Cuidado / Cuidadores do Pet */}
            <View style={styles.sectionBox}>
              <View style={styles.sectionHeader}>
                <View style={styles.sectionTitleRow}>
                  <Ionicons name="people" size={18} color="#2563EB" />
                  <Text style={styles.sectionTitle}>
                    Rede de Cuidado ({caregivers.length || 1})
                  </Text>
                </View>
                {isResponsavelPrincipal && (
                  <TouchableOpacity
                    style={styles.btnInvite}
                    onPress={() => setModalConviteVisivel(true)}
                    activeOpacity={0.7}
                  >
                    <Ionicons name="person-add" size={13} color="#2563EB" />
                    <Text style={styles.btnInviteText}>Convidar</Text>
                  </TouchableOpacity>
                )}
              </View>

              {caregivers.length === 0 ? (
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
                caregivers.map((c) => {
                  const isMe = c.usuarioId === user?.id;
                  return (
                    <CaregiverCard
                      key={c.usuarioId}
                      nome={c.nome}
                      email={c.email}
                      isPrincipal={c.responsavelPrincipal}
                      isCurrentUser={isMe}
                      onTransfer={
                        isResponsavelPrincipal && !isMe
                          ? () => transferirResponsabilidade(c.usuarioId, c.nome)
                          : undefined
                      }
                      onRemove={
                        isResponsavelPrincipal || isMe
                          ? () => removerCuidador(c.usuarioId, c.nome)
                          : undefined
                      }
                    />
                  );
                })
              )}
            </View>

            {/* Prontuário de Saúde & Eventos Clínicos (CRUD /historicos) */}
            <PetHealthHistoryList
              historicos={historicos}
              isLoading={isLoadingHistoricos}
              onAdd={handleAbrirNovoHistorico}
              onEdit={handleAbrirEdicaoHistorico}
              onDelete={handleExcluirHistorico}
            />

            {/* Histórico Consolidado de Rotina e Cuidados */}
            <PetHistoryList
              historico={historyData?.tarefasConcluidas || []}
              isLoading={isLoadingHistory}
            />
          </View>
        )}
      </ScrollView>

      {/* Modal de Edição de Ficha do Pet Reutilizável */}
      <PetFormModal
        visible={modalEdicaoVisivel}
        onClose={() => setModalEdicaoVisivel(false)}
        mode="edit"
        title={`Editar Ficha de ${activePet?.nome || 'Pet'}`}
        subtitle="Atualize os dados e informações cadastrais do animal"
        initialData={initialPetData}
        isLoading={isUpdatingPet}
        onSubmit={handleSalvarEdicao}
      />

      {/* Modal de Convidar Cuidador para o Pet */}
      <InviteCaregiverModal
        visible={modalConviteVisivel}
        onClose={() => setModalConviteVisivel(false)}
        pets={activePet ? [activePet] : pets}
        initialPetId={activePet?.id}
        isLoading={isInvitingCaregiver}
        onSubmit={handleConvidarCuidador}
      />

      {/* Modal de CRUD de Registro de Saúde / Histórico */}
      {activePet && (
        <HistoricoFormModal
          visible={modalHistoricoVisivel}
          onClose={() => setModalHistoricoVisivel(false)}
          mode={itemEdicaoHistorico ? 'edit' : 'create'}
          petId={activePet.id}
          initialData={itemEdicaoHistorico}
          isLoading={isSavingHistorico}
          onSubmit={handleSalvarHistorico}
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

