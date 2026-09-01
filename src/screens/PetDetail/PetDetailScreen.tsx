import React, { useState, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Platform,
  Image,
  Alert,
} from 'react-native';
import { MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
import { Header } from '../../components/Header';
import { LoadingSpinner } from '../../components/LoadingSpinner';
import { PetFormModal, PetFormData } from '../../components/PetFormModal';
import { getAvatarById } from '../../constants/Avatares';

import { usePets, usePetHistory, useUpdatePet, useDeletePet } from '../../hooks/usePets';
import { PetResponse } from '../../types/pet';
import { useSession } from '../../hooks/useSession';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { formatarIdadePet, normalizarDataNascParaIso, formatarIsoParaBr } from '../../utils/petUtils';

type PetDetailScreenProps = NativeStackScreenProps<any, 'PetDetail'>;

export default function PetDetailScreen({ navigation, route }: PetDetailScreenProps) {
  const { user } = useSession();
  const routePetId = route?.params?.petId;

  // Lista de todos os pets
  const { data: petsData, isLoading: isLoadingPets } = usePets();
  const pets: PetResponse[] = petsData?.content || [];

  const [selectedPetId, setSelectedPetId] = useState<number | null>(routePetId || null);

  const activePet: PetResponse | undefined = useMemo(() => {
    if (pets.length === 0) return undefined;
    if (selectedPetId) {
      const found = pets.find((p) => p.id === selectedPetId);
      if (found) return found;
    }
    return pets[0];
  }, [pets, selectedPetId]);

  // Histórico consolidado vindo da API Java (GET /pets/{id}/historico)
  const { data: historyData, isLoading: isLoadingHistory } = usePetHistory(activePet?.id);

  // Mutações
  const updatePetMutation = useUpdatePet();
  const deletePetMutation = useDeletePet();

  // Estados de Edição
  const [modalEdicaoVisivel, setModalEdicaoVisivel] = useState(false);

  const initialPetData = useMemo(() => {
    if (!activePet) return null;
    return {
      nome: activePet.nome,
      raca: activePet.raca,
      dataNasc: formatarIsoParaBr(activePet.dataNasc),
      porte: activePet.porte || 'MEDIO',
      sexo: activePet.sexo || 'M',
      castrado: activePet.castrado || false,
      avatarId: activePet.avatarId || '1',
    };
  }, [activePet]);

  const abrirEdicao = useCallback(() => {
    if (!activePet) return;
    setModalEdicaoVisivel(true);
  }, [activePet]);

  const handleSalvarEdicao = useCallback(async (formData: PetFormData) => {
    if (!activePet || !user) return;
    if (!formData.nome.trim() || !formData.raca.trim()) {
      Alert.alert('Aviso', 'Preencha o nome e a raça do pet.');
      return;
    }

    const dataNasc = normalizarDataNascParaIso(formData.dataNasc || activePet.dataNasc || '');

    try {
      await updatePetMutation.mutateAsync({
        id: activePet.id,
        data: {
          nome: formData.nome.trim(),
          dataNasc,
          raca: formData.raca.trim(),
          porte: formData.porte,
          sexo: formData.sexo,
          castrado: formData.castrado,
          usuarioId: user.id,
        },
      });
      setModalEdicaoVisivel(false);
      Alert.alert('Sucesso', 'Ficha do pet atualizada!');
    } catch {
      Alert.alert('Erro', 'Não foi possível atualizar o pet.');
    }
  }, [activePet, user, updatePetMutation]);

  const handleExcluirPet = useCallback(() => {
    if (!activePet) return;

    Alert.alert(
      'Remover Pet',
      `Deseja realmente excluir a ficha de ${activePet.nome}?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Excluir',
          style: 'destructive',
          onPress: async () => {
            try {
              await deletePetMutation.mutateAsync(activePet.id);
              setSelectedPetId(null);
              Alert.alert('Pronto', 'Pet removido com sucesso.');
            } catch {
              Alert.alert('Erro', 'Não foi possível excluir o pet.');
            }
          },
        },
      ]
    );
  }, [activePet, deletePetMutation]);

  if (isLoadingPets && pets.length === 0) {
    return <LoadingSpinner message="Carregando perfil do pet..." />;
  }

  if (pets.length === 0) {
    return (
      <View style={styles.container}>
        <View style={styles.paddingHeader}>
          <Header subtitle="Prontuário & Histórico Clínico" />
        </View>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 }}>
          <MaterialCommunityIcons name="paw-off" size={48} color="#94A3B8" />
          <Text style={{ fontSize: 16, fontWeight: '800', color: '#1E293B', marginTop: 12 }}>
            Nenhum pet encontrado
          </Text>
          <Text style={{ fontSize: 13, color: '#64748B', textAlign: 'center', marginTop: 4 }}>
            Vá até a aba Family Pet para cadastrar o primeiro membro.
          </Text>
        </View>
      </View>
    );
  }

  const avatar = getAvatarById(activePet?.avatarId);
  const historicoTarefas = historyData?.tarefasConcluidas || [];

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={{ paddingBottom: 120 }} showsVerticalScrollIndicator={false}>
        <View style={styles.paddingHeader}>
          <Header subtitle="Ficha Completa & Prontuário" />
        </View>

        {/* Carrossel de seleção do Pet */}
        <View style={styles.carrosselContainer}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.listaDePets}>
            {pets.map((pet) => {
              const isSelected = activePet?.id === pet.id;
              const petAvatar = getAvatarById(pet.avatarId);
              return (
                <TouchableOpacity
                  key={pet.id}
                  onPress={() => setSelectedPetId(pet.id)}
                  style={styles.itemPetCarrossel}
                  activeOpacity={0.8}
                >
                  <View style={[styles.miniAvatarBorda, isSelected && styles.miniAvatarSelecionado]}>
                    {petAvatar ? (
                      <Image source={petAvatar} style={styles.miniAvatarImg} />
                    ) : (
                      <MaterialCommunityIcons name="paw" size={20} color={isSelected ? '#2563EB' : '#94A3B8'} />
                    )}
                  </View>
                  <Text style={[styles.miniAvatarTexto, isSelected && styles.miniAvatarTextoSelecionado]} numberOfLines={1}>
                    {pet.nome.split(' ')[0]}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>

        {activePet && (
          <View style={styles.contentPadding}>
            {/* Card Principal do Perfil do Pet */}
            <View style={styles.petHeaderCard}>
              <View style={styles.avatarLargeWrapper}>
                {avatar ? (
                  <Image source={avatar} style={styles.avatarLargeImg} />
                ) : (
                  <MaterialCommunityIcons name="paw" size={44} color="#2563EB" />
                )}
              </View>

              <Text style={styles.petHeaderName}>{activePet.nome}</Text>
              <Text style={styles.petHeaderBreed}>{activePet.raca || 'Sem raça definida'}</Text>

              <View style={styles.tagsRow}>
                <View style={styles.tagBadge}>
                  <Text style={styles.tagText}>Porte {activePet.porte}</Text>
                </View>
                <View style={styles.tagBadge}>
                  <Text style={styles.tagText}>{formatarIdadePet(activePet.dataNasc, activePet.idade)}</Text>
                </View>
                <View style={styles.tagBadge}>
                  <Text style={styles.tagText}>{activePet.sexo === 'M' ? 'Macho' : 'Fêmea'}</Text>
                </View>
                <View style={[styles.tagBadge, { backgroundColor: activePet.castrado ? '#ECFDF5' : '#FFFBEB' }]}>
                  <Text style={[styles.tagText, { color: activePet.castrado ? '#059669' : '#D97706' }]}>
                    {activePet.castrado ? 'Castrado' : 'Não castrado'}
                  </Text>
                </View>
              </View>

              <View style={styles.actionButtonsRow}>
                <TouchableOpacity style={styles.btnEditar} onPress={abrirEdicao}>
                  <Ionicons name="pencil" size={15} color="#2563EB" />
                  <Text style={styles.btnEditarText}>Editar Ficha</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.btnExcluir} onPress={handleExcluirPet}>
                  <Ionicons name="trash-outline" size={15} color="#EF4444" />
                  <Text style={styles.btnExcluirText}>Excluir</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Histórico Consolidado (GET /pets/{id}/historico) */}
            <View style={styles.historyCard}>
              <View style={styles.historyHeader}>
                <MaterialCommunityIcons name="clipboard-pulse-outline" size={20} color="#2563EB" />
                <Text style={styles.historyTitle}>Histórico de Cuidados & Saúde</Text>
              </View>

              {isLoadingHistory ? (
                <LoadingSpinner message="Buscando histórico consolidado..." size="small" />
              ) : historicoTarefas.length === 0 ? (
                <View style={styles.emptyHistory}>
                  <MaterialCommunityIcons name="history" size={28} color="#CBD5E1" />
                  <Text style={styles.emptyHistoryText}>Nenhum registro clínico concluído ainda.</Text>
                  <Text style={styles.emptyHistorySub}>As rotinas concluídas na Home são sincronizadas aqui!</Text>
                </View>
              ) : (
                historicoTarefas.map((t) => (
                  <View key={t.id} style={styles.historyItem}>
                    <View style={styles.historyItemIcon}>
                      <Ionicons name="checkmark-circle" size={18} color="#10B981" />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.historyItemTitle}>{t.titulo}</Text>
                      {t.descricao ? <Text style={styles.historyItemDesc}>{t.descricao}</Text> : null}
                      <Text style={styles.historyItemDate}>
                        {t.conclusao ? new Date(t.conclusao).toLocaleDateString('pt-BR') : 'Concluído'}
                      </Text>
                    </View>
                    <View style={styles.historyPoints}>
                      <Text style={styles.historyPointsText}>+{t.pontosTarefa} pts</Text>
                    </View>
                  </View>
                ))
              )}
            </View>
          </View>
        )}
      </ScrollView>

      {/* Modal de Edição de Ficha do Pet Reutilizável */}
      <PetFormModal
        visible={modalEdicaoVisivel}
        onClose={() => setModalEdicaoVisivel(false)}
        mode="edit"
        title={`Editar Ficha de ${activePet?.nome || 'Pet'}`}
        subtitle="Atualize os dados clínicos e cadastrais do animal"
        initialData={initialPetData}
        isLoading={updatePetMutation.isPending}
        onSubmit={handleSalvarEdicao}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  paddingHeader: { paddingHorizontal: 20, paddingTop: Platform.OS === 'ios' ? 50 : 25 },
  carrosselContainer: { paddingVertical: 12, backgroundColor: '#FFFFFF', borderBottomWidth: 1, borderBottomColor: '#F1F5F9' },
  listaDePets: { paddingHorizontal: 20, gap: 12, alignItems: 'center' },
  itemPetCarrossel: { alignItems: 'center', width: 62 },
  miniAvatarBorda: { width: 50, height: 50, borderRadius: 25, borderWidth: 2, borderColor: '#E2E8F0', justifyContent: 'center', alignItems: 'center', overflow: 'hidden' },
  miniAvatarSelecionado: { borderColor: '#2563EB' },
  miniAvatarImg: { width: '100%', height: '100%' },
  miniAvatarTexto: { fontSize: 11, color: '#64748B', marginTop: 4, fontWeight: '700' },
  miniAvatarTextoSelecionado: { color: '#2563EB', fontWeight: '800' },
  contentPadding: { paddingHorizontal: 20, paddingTop: 16, gap: 16 },
  petHeaderCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 22,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(226, 232, 240, 0.8)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.03,
    shadowRadius: 10,
    elevation: 2,
  },
  avatarLargeWrapper: { width: 84, height: 84, borderRadius: 42, backgroundColor: '#EFF6FF', justifyContent: 'center', alignItems: 'center', overflow: 'hidden', borderWidth: 2.5, borderColor: '#2563EB', marginBottom: 12 },
  avatarLargeImg: { width: '100%', height: '100%' },
  petHeaderName: { fontSize: 22, fontWeight: '900', color: '#0F172A' },
  petHeaderBreed: { fontSize: 13, color: '#64748B', marginTop: 2, marginBottom: 14 },
  tagsRow: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 6, marginBottom: 16 },
  tagBadge: { backgroundColor: '#F1F5F9', paddingVertical: 5, paddingHorizontal: 10, borderRadius: 10 },
  tagText: { fontSize: 11, fontWeight: '700', color: '#334155' },
  actionButtonsRow: { flexDirection: 'row', gap: 10, width: '100%', borderTopWidth: 1, borderTopColor: '#F1F5F9', paddingTop: 14 },
  btnEditar: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', padding: 11, borderRadius: 12, backgroundColor: '#EFF6FF', gap: 6 },
  btnEditarText: { color: '#2563EB', fontWeight: '800', fontSize: 12 },
  btnExcluir: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', padding: 11, borderRadius: 12, backgroundColor: '#FEF2F2', gap: 6 },
  btnExcluirText: { color: '#EF4444', fontWeight: '800', fontSize: 12 },
  historyCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(226, 232, 240, 0.8)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.03,
    shadowRadius: 10,
    elevation: 2,
    gap: 12,
  },
  historyHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 4 },
  historyTitle: { fontSize: 16, fontWeight: '800', color: '#0F172A' },
  emptyHistory: { alignItems: 'center', padding: 20, gap: 4 },
  emptyHistoryText: { fontSize: 13, fontWeight: '700', color: '#64748B' },
  emptyHistorySub: { fontSize: 11, color: '#94A3B8' },
  historyItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#F1F5F9', gap: 10 },
  historyItemIcon: { width: 26, height: 26, justifyContent: 'center', alignItems: 'center' },
  historyItemTitle: { fontSize: 13, fontWeight: '700', color: '#1E293B' },
  historyItemDesc: { fontSize: 11, color: '#64748B', marginTop: 1 },
  historyItemDate: { fontSize: 10, color: '#94A3B8', marginTop: 1 },
  historyPoints: { backgroundColor: '#ECFDF5', paddingVertical: 3, paddingHorizontal: 8, borderRadius: 8 },
  historyPointsText: { fontSize: 11, fontWeight: '800', color: '#059669' },
});
