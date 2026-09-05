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
import { PetAvatarCarousel } from '../../components/PetAvatarCarousel';
import { PetHeaderCard } from '../../components/PetHeaderCard';
import { PetHistoryList } from '../../components/PetHistoryList';
import { usePetDetail } from '../../hooks/usePetDetail';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { FamilyStackParamList } from '../../routes/types';

type PetDetailScreenProps = NativeStackScreenProps<FamilyStackParamList, 'PetDetail'>;

export default function PetDetailScreen({ route, navigation }: PetDetailScreenProps) {
  const routePetId = route?.params?.petId;

  const {
    pets,
    activePet,
    setSelectedPetId,
    historyData,
    initialPetData,
    isLoading,
    isLoadingHistory,
    salvarEdicaoPet,
    excluirPet,
    isUpdatingPet,
  } = usePetDetail(routePetId);

  const [modalEdicaoVisivel, setModalEdicaoVisivel] = useState(false);

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

            {/* Histórico Consolidado de Cuidados */}
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
});
