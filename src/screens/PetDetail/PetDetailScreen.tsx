import React, { useState, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Platform,
  KeyboardAvoidingView,
  Image,
  Alert,
} from 'react-native';
import { MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
import { Header } from '../../components/Header';
import { LoadingSpinner } from '../../components/LoadingSpinner';
import { CustomInput } from '../../components/CustomInput';
import { getAvatarById } from '../../constants/Avatares';

import { usePets, usePetHistory, useUpdatePet, useDeletePet } from '../../hooks/usePets';
import { PetPorte, PetResponse } from '../../types/pet';
import { useSession } from '../../hooks/useSession';

export default function PetDetailScreen({ navigation, route }: any) {
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
  const [editForm, setEditForm] = useState({
    nome: '',
    raca: '',
    idade: '1',
    porte: 'MEDIO' as PetPorte,
    sexo: 'M',
    castrado: false,
    avatarId: '1',
  });

  const abrirEdicao = useCallback(() => {
    if (!activePet) return;
    setEditForm({
      nome: activePet.nome,
      raca: activePet.raca,
      idade: String(activePet.idade),
      porte: activePet.porte || 'MEDIO',
      sexo: activePet.sexo || 'M',
      castrado: activePet.castrado || false,
      avatarId: activePet.avatarId || '1',
    });
    setModalEdicaoVisivel(true);
  }, [activePet]);

  const handleSalvarEdicao = useCallback(async () => {
    if (!activePet || !user) return;
    if (!editForm.nome.trim() || !editForm.raca.trim()) {
      Alert.alert('Aviso', 'Preencha o nome e a raça do pet.');
      return;
    }

    try {
      await updatePetMutation.mutateAsync({
        id: activePet.id,
        data: {
          nome: editForm.nome.trim(),
          raca: editForm.raca.trim(),
          idade: Number(editForm.idade) || 0,
          porte: editForm.porte,
          sexo: editForm.sexo,
          castrado: editForm.castrado,
          usuarioId: user.id,
        },
      });
      setModalEdicaoVisivel(false);
      Alert.alert('Sucesso', 'Ficha do pet atualizada!');
    } catch {
      Alert.alert('Erro', 'Não foi possível atualizar o pet.');
    }
  }, [activePet, user, editForm, updatePetMutation]);

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
                  <Text style={styles.tagText}>{activePet.idade} {activePet.idade === 1 ? 'ano' : 'anos'}</Text>
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

      {/* Modal de Edição de Ficha do Pet */}
      {modalEdicaoVisivel && (
        <View style={styles.modalOverlay}>
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={{ flex: 1, justifyContent: 'center' }}
          >
            <View style={styles.modalCard}>
              <Text style={styles.modalTitle}>Editar Ficha de {activePet?.nome}</Text>

              <ScrollView showsVerticalScrollIndicator={false} style={{ maxHeight: 380 }}>
                <CustomInput
                  label="Nome do Pet"
                  value={editForm.nome}
                  onChangeText={(t) => setEditForm((p) => ({ ...p, nome: t }))}
                />

                <CustomInput
                  label="Raça"
                  value={editForm.raca}
                  onChangeText={(t) => setEditForm((p) => ({ ...p, raca: t }))}
                />

                <CustomInput
                  label="Idade (anos)"
                  keyboardType="numeric"
                  value={editForm.idade}
                  onChangeText={(t) => setEditForm((p) => ({ ...p, idade: t }))}
                />

                {/* Porte */}
                <Text style={styles.fieldLabel}>Porte do Animal</Text>
                <View style={styles.porteRow}>
                  {(['PEQUENO', 'MEDIO', 'GRANDE'] as PetPorte[]).map((porte) => (
                    <TouchableOpacity
                      key={porte}
                      style={[styles.porteBtn, editForm.porte === porte && styles.porteBtnSelected]}
                      onPress={() => setEditForm((p) => ({ ...p, porte }))}
                    >
                      <Text
                        style={[
                          styles.porteBtnText,
                          editForm.porte === porte && styles.porteBtnTextSelected,
                        ]}
                      >
                        {porte}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>

                {/* Castrado */}
                <Text style={styles.fieldLabel}>Castrado?</Text>
                <View style={styles.porteRow}>
                  <TouchableOpacity
                    style={[styles.porteBtn, editForm.castrado && styles.porteBtnSelected]}
                    onPress={() => setEditForm((p) => ({ ...p, castrado: true }))}
                  >
                    <Text
                      style={[
                        styles.porteBtnText,
                        editForm.castrado && styles.porteBtnTextSelected,
                      ]}
                    >
                      Sim
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.porteBtn, !editForm.castrado && styles.porteBtnSelected]}
                    onPress={() => setEditForm((p) => ({ ...p, castrado: false }))}
                  >
                    <Text
                      style={[
                        styles.porteBtnText,
                        !editForm.castrado && styles.porteBtnTextSelected,
                      ]}
                    >
                      Não
                    </Text>
                  </TouchableOpacity>
                </View>
              </ScrollView>

              <View style={styles.modalButtonsRow}>
                <TouchableOpacity
                  style={styles.btnModalCancel}
                  onPress={() => setModalEdicaoVisivel(false)}
                >
                  <Text style={styles.btnModalCancelText}>Cancelar</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.btnModalConfirm}
                  onPress={handleSalvarEdicao}
                >
                  <Text style={styles.btnModalConfirmText}>Salvar</Text>
                </TouchableOpacity>
              </View>
            </View>
          </KeyboardAvoidingView>
        </View>
      )}
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
  modalOverlay: { position: 'absolute', top: 0, bottom: 0, left: 0, right: 0, backgroundColor: 'rgba(15, 23, 42, 0.55)', justifyContent: 'center', padding: 20, zIndex: 999 },
  modalCard: { backgroundColor: '#FFFFFF', borderRadius: 24, padding: 22, elevation: 10 },
  modalTitle: { fontSize: 18, fontWeight: '900', color: '#0F172A', marginBottom: 16, textAlign: 'center' },
  fieldLabel: { fontSize: 12, fontWeight: '700', color: '#334155', marginTop: 8, marginBottom: 6 },
  porteRow: { flexDirection: 'row', gap: 8, marginBottom: 12 },
  porteBtn: { flex: 1, paddingVertical: 10, borderRadius: 12, backgroundColor: '#F1F5F9', alignItems: 'center' },
  porteBtnSelected: { backgroundColor: '#2563EB' },
  porteBtnText: { fontSize: 12, fontWeight: '700', color: '#64748B' },
  porteBtnTextSelected: { color: '#FFFFFF' },
  modalButtonsRow: { flexDirection: 'row', gap: 10, marginTop: 16 },
  btnModalCancel: { flex: 1, padding: 14, borderRadius: 14, backgroundColor: '#F1F5F9', alignItems: 'center' },
  btnModalCancelText: { color: '#64748B', fontWeight: '700' },
  btnModalConfirm: { flex: 1, padding: 14, borderRadius: 14, backgroundColor: '#2563EB', alignItems: 'center' },
  btnModalConfirmText: { color: '#FFFFFF', fontWeight: '800' },
});
