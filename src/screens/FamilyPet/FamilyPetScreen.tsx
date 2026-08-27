import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Platform,
  KeyboardAvoidingView,
  Alert,
  Image,
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { Header } from '../../components/Header';
import { LoadingSpinner } from '../../components/LoadingSpinner';
import { CustomInput } from '../../components/CustomInput';
import { getAvatarById } from '../../constants/Avatares';

import { useSession } from '../../hooks/useSession';
import { usePets, useCreatePet, useInviteCaregiver } from '../../hooks/usePets';
import { useTasks, useCreateTask, useDeleteTask } from '../../hooks/useTasks';
import { useRedeCuidado } from '../../hooks/useRedeCuidado';
import { PetPorte, PetResponse } from '../../types/pet';
import { TarefaResponse } from '../../types/task';

export default function FamilyPetScreen({ navigation }: any) {
  const { user } = useSession();

  // Queries
  const { data: petsData, isLoading: isLoadingPets } = usePets();
  const { data: tasksData, isLoading: isLoadingTasks } = useTasks();
  const { data: redeCuidadoData, isLoading: isLoadingRede } = useRedeCuidado(user?.id);

  const createPetMutation = useCreatePet();
  const createTaskMutation = useCreateTask();
  const deleteTaskMutation = useDeleteTask();
  const inviteMutation = useInviteCaregiver();

  const pets: PetResponse[] = petsData?.content || [];
  const tasks: TarefaResponse[] = tasksData?.content || [];
  const coCuidadores = redeCuidadoData?.coCuidadores || [];

  // Modais
  const [modalNovoPet, setModalNovoPet] = useState(false);
  const [modalNovaTarefa, setModalNovaTarefa] = useState(false);
  const [modalConvite, setModalConvite] = useState(false);

  // Form de Novo Pet
  const [formPet, setFormPet] = useState({
    nome: '',
    raca: '',
    idade: '1',
    porte: 'MEDIO' as PetPorte,
    sexo: 'M',
    castrado: false,
    avatarId: '1',
  });

  // Form de Nova Tarefa
  const [formTarefa, setFormTarefa] = useState({
    titulo: '',
    descricao: '',
    pontos: '15',
    petId: null as number | null,
  });

  // Form de Convite
  const [emailConvidado, setEmailConvidado] = useState('');
  const [petConviteId, setPetConviteId] = useState<number | null>(null);

  // Salvar Novo Pet na API Java (POST /pets)
  const handleCadastrarPet = useCallback(async () => {
    if (!user) return;
    if (!formPet.nome.trim() || !formPet.raca.trim()) {
      Alert.alert('Campos obrigatórios', 'Por favor, informe o nome e a raça do pet.');
      return;
    }

    try {
      await createPetMutation.mutateAsync({
        nome: formPet.nome.trim(),
        raca: formPet.raca.trim(),
        idade: Number(formPet.idade) || 0,
        porte: formPet.porte,
        sexo: formPet.sexo,
        castrado: formPet.castrado,
        usuarioId: user.id,
      });

      setModalNovoPet(false);
      setFormPet({
        nome: '',
        raca: '',
        idade: '1',
        porte: 'MEDIO',
        sexo: 'M',
        castrado: false,
        avatarId: '1',
      });
      Alert.alert('Sucesso!', 'Novo pet cadastrado na família com sucesso!');
    } catch {
      Alert.alert('Erro', 'Não foi possível cadastrar o pet na API Java.');
    }
  }, [user, formPet, createPetMutation]);

  // Salvar Nova Tarefa para o Pet na API Java (POST /tarefas)
  const handleCadastrarTarefa = useCallback(async () => {
    if (!user) return;
    const petTargetId = formTarefa.petId || (pets.length > 0 ? pets[0].id : null);
    if (!petTargetId) {
      Alert.alert('Aviso', 'Cadastre ou selecione um pet antes de adicionar tarefas.');
      return;
    }
    if (!formTarefa.titulo.trim()) {
      Alert.alert('Campo Obrigatório', 'Informe o título da tarefa.');
      return;
    }

    try {
      const prazoData = new Date();
      prazoData.setHours(23, 59, 0, 0);

      await createTaskMutation.mutateAsync({
        titulo: formTarefa.titulo.trim(),
        descricao: formTarefa.descricao.trim() || 'Cuidado diário da família',
        pontosTarefa: Number(formTarefa.pontos) || 15,
        prazo: prazoData.toISOString(),
        usuarioId: null,
        petId: petTargetId,
        status: 'PENDENTE',
      });

      setModalNovaTarefa(false);
      setFormTarefa({
        titulo: '',
        descricao: '',
        pontos: '15',
        petId: null,
      });
      Alert.alert('Sucesso!', 'Tarefa criada para a rotina do pet!');
    } catch {
      Alert.alert('Erro', 'Não foi possível cadastrar a tarefa na API Java.');
    }
  }, [user, formTarefa, pets, createTaskMutation]);

  // Enviar convite de co-cuidador (POST /pets/{id}/cuidadores)
  const handleEnviarConvite = useCallback(async () => {
    if (!user) return;
    if (!emailConvidado.trim() || !petConviteId) {
      Alert.alert('Aviso', 'Informe o e-mail do familiar e selecione o pet.');
      return;
    }

    try {
      await inviteMutation.mutateAsync({
        petId: petConviteId,
        responsavelPrincipalId: user.id,
        email: emailConvidado.trim().toLowerCase(),
      });
      setModalConvite(false);
      setEmailConvidado('');
      setPetConviteId(null);
      Alert.alert('Convite Enviado!', 'O cuidador foi vinculado à rede de cuidados do pet.');
    } catch {
      Alert.alert('Erro', 'Não foi possível enviar o convite.');
    }
  }, [user, emailConvidado, petConviteId, inviteMutation]);

  if (isLoadingPets && isLoadingRede && pets.length === 0) {
    return <LoadingSpinner message="Carregando rede da família..." />;
  }

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <Header subtitle="Cuidado Familiar & Pets" />

        {/* Resumo da Rede de Cuidado */}
        <View style={styles.summaryCard}>
          <View style={styles.summaryTop}>
            <View>
              <Text style={styles.summaryTitle}>Família de {user?.nome?.split(' ')[0] || 'Tutor'}</Text>
              <Text style={styles.summarySub}>
                {pets.length} {pets.length === 1 ? 'pet' : 'pets'} • {tasks.length} {tasks.length === 1 ? 'tarefa' : 'tarefas'} • {coCuidadores.length + 1} cuidadores
              </Text>
            </View>
            <View style={styles.xpCircle}>
              <Text style={styles.xpCircleVal}>{redeCuidadoData?.pontosAcumulados || 0}</Text>
              <Text style={styles.xpCircleLabel}>XP Total</Text>
            </View>
          </View>
        </View>

        {/* Seção de Animais da Família */}
        <View style={styles.sectionBox}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Animais da Família</Text>
            <TouchableOpacity style={styles.btnAddPet} onPress={() => setModalNovoPet(true)}>
              <Ionicons name="add" size={16} color="#FFFFFF" />
              <Text style={styles.btnAddPetText}>Adicionar Pet</Text>
            </TouchableOpacity>
          </View>

          {pets.length === 0 ? (
            <View style={styles.emptyBox}>
              <MaterialCommunityIcons name="paw-off" size={28} color="#CBD5E1" />
              <Text style={styles.emptyTitle}>Nenhum pet cadastrado</Text>
              <Text style={styles.emptySub}>Clique no botão acima para adicionar o primeiro pet!</Text>
            </View>
          ) : (
            <View style={styles.petsGrid}>
              {pets.map((pet) => {
                const avatar = getAvatarById(pet.avatarId);
                return (
                  <TouchableOpacity
                    key={pet.id}
                    style={styles.petItemCard}
                    onPress={() => navigation.navigate('PetDetail', { petId: pet.id })}
                    activeOpacity={0.85}
                  >
                    <View style={styles.petItemAvatar}>
                      {avatar ? (
                        <Image source={avatar} style={{ width: '100%', height: '100%' }} />
                      ) : (
                        <MaterialCommunityIcons name="paw" size={24} color="#2563EB" />
                      )}
                    </View>
                    <Text style={styles.petItemName} numberOfLines={1}>
                      {pet.nome}
                    </Text>
                    <Text style={styles.petItemBreed} numberOfLines={1}>
                      {pet.raca || 'Pet'}
                    </Text>
                    <View style={styles.petItemBadge}>
                      <Text style={styles.petItemBadgeText}>Porte {pet.porte}</Text>
                    </View>
                  </TouchableOpacity>
                );
              })}
            </View>
          )}
        </View>

        {/* Seção de Tarefas da Rotina */}
        <View style={styles.sectionBox}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Rotina & Tarefas</Text>
            <TouchableOpacity
              style={styles.btnAddTask}
              onPress={() => {
                if (pets.length > 0) setFormTarefa((p) => ({ ...p, petId: pets[0].id }));
                setModalNovaTarefa(true);
              }}
            >
              <Ionicons name="add" size={16} color="#FFFFFF" />
              <Text style={styles.btnAddTaskText}>Nova Tarefa</Text>
            </TouchableOpacity>
          </View>

          {tasks.length === 0 ? (
            <View style={styles.emptyBox}>
              <MaterialCommunityIcons name="clipboard-outline" size={28} color="#CBD5E1" />
              <Text style={styles.emptyTitle}>Nenhuma tarefa cadastrada</Text>
              <Text style={styles.emptySub}>Crie tarefas como passeios, remédios e ração.</Text>
            </View>
          ) : (
            <View style={{ gap: 8 }}>
              {tasks.slice(0, 5).map((t) => {
                const petName = pets.find((p) => p.id === t.petId)?.nome || 'Pet';
                return (
                  <View key={t.id} style={styles.taskListItem}>
                    <View style={styles.taskIconBox}>
                      <MaterialCommunityIcons
                        name={t.status === 'CONCLUIDO' ? 'check-circle' : 'circle-outline'}
                        size={18}
                        color={t.status === 'CONCLUIDO' ? '#10B981' : '#2563EB'}
                      />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.taskListTitle}>{t.titulo}</Text>
                      <Text style={styles.taskListPet}>Para: {petName} • +{t.pontosTarefa} XP</Text>
                    </View>
                    <TouchableOpacity
                      onPress={() => {
                        Alert.alert('Remover Tarefa', 'Deseja excluir esta tarefa?', [
                          { text: 'Cancelar', style: 'cancel' },
                          { text: 'Excluir', style: 'destructive', onPress: () => deleteTaskMutation.mutate(t.id) },
                        ]);
                      }}
                      hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                    >
                      <Ionicons name="trash-outline" size={16} color="#94A3B8" />
                    </TouchableOpacity>
                  </View>
                );
              })}
            </View>
          )}
        </View>

        {/* Seção de Co-Cuidadores */}
        <View style={styles.sectionBox}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Co-Cuidadores</Text>
            <TouchableOpacity
              style={styles.btnInvite}
              onPress={() => {
                if (pets.length > 0) setPetConviteId(pets[0].id);
                setModalConvite(true);
              }}
            >
              <Ionicons name="person-add" size={14} color="#2563EB" />
              <Text style={styles.btnInviteText}>Convidar</Text>
            </TouchableOpacity>
          </View>

          {/* Meu perfil */}
          <View style={styles.caregiverCard}>
            <View style={styles.caregiverAvatar}>
              <Text style={styles.caregiverInitials}>{(user?.nome || 'TU').substring(0, 2).toUpperCase()}</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.caregiverName}>{user?.nome} (Você)</Text>
              <Text style={styles.caregiverRole}>Responsável Principal</Text>
            </View>
            <View style={styles.roleBadge}>
              <Text style={styles.roleBadgeText}>Tutor</Text>
            </View>
          </View>

          {/* Co-cuidadores */}
          {coCuidadores.map((c) => (
            <View key={c.id} style={styles.caregiverCard}>
              <View style={[styles.caregiverAvatar, { backgroundColor: '#F1F5F9' }]}>
                <Text style={[styles.caregiverInitials, { color: '#475569' }]}>
                  {c.nome.substring(0, 2).toUpperCase()}
                </Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.caregiverName}>{c.nome}</Text>
                <Text style={styles.caregiverRole}>{c.email}</Text>
              </View>
              <View style={[styles.roleBadge, { backgroundColor: '#F1F5F9' }]}>
                <Text style={[styles.roleBadgeText, { color: '#64748B' }]}>Co-cuidador</Text>
              </View>
            </View>
          ))}
        </View>

        <View style={{ height: 110 }} />
      </ScrollView>

      {/* Modal de Cadastro de Pet */}
      {modalNovoPet && (
        <View style={styles.modalOverlay}>
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={{ flex: 1, justifyContent: 'center' }}
          >
            <View style={styles.modalCard}>
              <Text style={styles.modalTitle}>Cadastrar Novo Pet</Text>

              <ScrollView showsVerticalScrollIndicator={false} style={{ maxHeight: 380 }}>
                <CustomInput
                  label="Nome do Pet"
                  placeholder="Ex: Luna, Thor, Bob..."
                  value={formPet.nome}
                  onChangeText={(t) => setFormPet((p) => ({ ...p, nome: t }))}
                />

                <CustomInput
                  label="Raça"
                  placeholder="Ex: Golden Retriever, SRD, Poodle..."
                  value={formPet.raca}
                  onChangeText={(t) => setFormPet((p) => ({ ...p, raca: t }))}
                />

                <CustomInput
                  label="Idade (anos)"
                  placeholder="Ex: 2"
                  keyboardType="numeric"
                  value={formPet.idade}
                  onChangeText={(t) => setFormPet((p) => ({ ...p, idade: t }))}
                />

                <Text style={styles.fieldLabel}>Porte</Text>
                <View style={styles.porteRow}>
                  {(['PEQUENO', 'MEDIO', 'GRANDE'] as PetPorte[]).map((porte) => (
                    <TouchableOpacity
                      key={porte}
                      style={[styles.porteBtn, formPet.porte === porte && styles.porteBtnSelected]}
                      onPress={() => setFormPet((p) => ({ ...p, porte }))}
                    >
                      <Text
                        style={[
                          styles.porteBtnText,
                          formPet.porte === porte && styles.porteBtnTextSelected,
                        ]}
                      >
                        {porte}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>

                <Text style={styles.fieldLabel}>Sexo</Text>
                <View style={styles.porteRow}>
                  <TouchableOpacity
                    style={[styles.porteBtn, formPet.sexo === 'M' && styles.porteBtnSelected]}
                    onPress={() => setFormPet((p) => ({ ...p, sexo: 'M' }))}
                  >
                    <Text
                      style={[
                        styles.porteBtnText,
                        formPet.sexo === 'M' && styles.porteBtnTextSelected,
                      ]}
                    >
                      Macho
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.porteBtn, formPet.sexo === 'F' && styles.porteBtnSelected]}
                    onPress={() => setFormPet((p) => ({ ...p, sexo: 'F' }))}
                  >
                    <Text
                      style={[
                        styles.porteBtnText,
                        formPet.sexo === 'F' && styles.porteBtnTextSelected,
                      ]}
                    >
                      Fêmea
                    </Text>
                  </TouchableOpacity>
                </View>
              </ScrollView>

              <View style={styles.modalButtonsRow}>
                <TouchableOpacity
                  style={styles.btnModalCancel}
                  onPress={() => setModalNovoPet(false)}
                >
                  <Text style={styles.btnModalCancelText}>Cancelar</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.btnModalConfirm}
                  onPress={handleCadastrarPet}
                >
                  <Text style={styles.btnModalConfirmText}>Cadastrar</Text>
                </TouchableOpacity>
              </View>
            </View>
          </KeyboardAvoidingView>
        </View>
      )}

      {/* Modal de Criação de Tarefa do Pet */}
      {modalNovaTarefa && (
        <View style={styles.modalOverlay}>
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={{ flex: 1, justifyContent: 'center' }}
          >
            <View style={styles.modalCard}>
              <Text style={styles.modalTitle}>Criar Tarefa para o Pet</Text>

              <ScrollView showsVerticalScrollIndicator={false} style={{ maxHeight: 380 }}>
                <Text style={styles.fieldLabel}>Para qual Pet?</Text>
                <View style={styles.porteRow}>
                  {pets.map((p) => (
                    <TouchableOpacity
                      key={p.id}
                      style={[styles.porteBtn, formTarefa.petId === p.id && styles.porteBtnSelected]}
                      onPress={() => setFormTarefa((prev) => ({ ...prev, petId: p.id }))}
                    >
                      <Text
                        style={[
                          styles.porteBtnText,
                          formTarefa.petId === p.id && styles.porteBtnTextSelected,
                        ]}
                      >
                        {p.nome}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>

                <CustomInput
                  label="Título da Tarefa"
                  placeholder="Ex: Passeio de 30min, Ração da tarde..."
                  value={formTarefa.titulo}
                  onChangeText={(t) => setFormTarefa((p) => ({ ...p, titulo: t }))}
                />

                <CustomInput
                  label="Descrição detalhada"
                  placeholder="Instruções ou remédios a dar..."
                  value={formTarefa.descricao}
                  onChangeText={(t) => setFormTarefa((p) => ({ ...p, descricao: t }))}
                />

                <CustomInput
                  label="Pontos XP de Recompensa"
                  placeholder="15"
                  keyboardType="numeric"
                  value={formTarefa.pontos}
                  onChangeText={(t) => setFormTarefa((p) => ({ ...p, pontos: t }))}
                />
              </ScrollView>

              <View style={styles.modalButtonsRow}>
                <TouchableOpacity
                  style={styles.btnModalCancel}
                  onPress={() => setModalNovaTarefa(false)}
                >
                  <Text style={styles.btnModalCancelText}>Cancelar</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.btnModalConfirm}
                  onPress={handleCadastrarTarefa}
                >
                  <Text style={styles.btnModalConfirmText}>Criar Tarefa</Text>
                </TouchableOpacity>
              </View>
            </View>
          </KeyboardAvoidingView>
        </View>
      )}

      {/* Modal de Convidar Co-Cuidador */}
      {modalConvite && (
        <View style={styles.modalOverlay}>
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={{ flex: 1, justifyContent: 'center' }}
          >
            <View style={styles.modalCard}>
              <Text style={styles.modalTitle}>Convidar Familiar</Text>
              <Text style={styles.modalSub}>
                Vincule um membro da família para compartilhar a rotina do animal.
              </Text>

              <CustomInput
                label="E-mail do Familiar"
                placeholder="familiar@email.com"
                keyboardType="email-address"
                autoCapitalize="none"
                value={emailConvidado}
                onChangeText={setEmailConvidado}
              />

              <Text style={styles.fieldLabel}>Selecione o Pet</Text>
              <View style={styles.porteRow}>
                {pets.map((p) => (
                  <TouchableOpacity
                    key={p.id}
                    style={[styles.porteBtn, petConviteId === p.id && styles.porteBtnSelected]}
                    onPress={() => setPetConviteId(p.id)}
                  >
                    <Text
                      style={[
                        styles.porteBtnText,
                        petConviteId === p.id && styles.porteBtnTextSelected,
                      ]}
                    >
                      {p.nome}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <View style={styles.modalButtonsRow}>
                <TouchableOpacity
                  style={styles.btnModalCancel}
                  onPress={() => setModalConvite(false)}
                >
                  <Text style={styles.btnModalCancelText}>Cancelar</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.btnModalConfirm}
                  onPress={handleEnviarConvite}
                >
                  <Text style={styles.btnModalConfirmText}>Enviar Convite</Text>
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
  scrollContent: { paddingHorizontal: 20, paddingTop: 10, gap: 16 },
  summaryCard: {
    backgroundColor: '#0F172A',
    borderRadius: 24,
    padding: 22,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 3,
  },
  summaryTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  summaryTitle: { fontSize: 18, fontWeight: '900', color: '#FFFFFF' },
  summarySub: { fontSize: 12, color: 'rgba(255, 255, 255, 0.7)', marginTop: 4 },
  xpCircle: { backgroundColor: 'rgba(255, 255, 255, 0.15)', paddingVertical: 8, paddingHorizontal: 14, borderRadius: 16, alignItems: 'center' },
  xpCircleVal: { fontSize: 17, fontWeight: '900', color: '#FFFFFF' },
  xpCircleLabel: { fontSize: 10, color: 'rgba(255, 255, 255, 0.8)', fontWeight: '700' },
  sectionBox: {
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
  },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 },
  sectionTitle: { fontSize: 16, fontWeight: '800', color: '#0F172A' },
  btnAddPet: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#0F172A', paddingVertical: 6, paddingHorizontal: 12, borderRadius: 12, gap: 4 },
  btnAddPetText: { color: '#FFFFFF', fontWeight: '800', fontSize: 12 },
  btnAddTask: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#10B981', paddingVertical: 6, paddingHorizontal: 12, borderRadius: 12, gap: 4 },
  btnAddTaskText: { color: '#FFFFFF', fontWeight: '800', fontSize: 12 },
  btnInvite: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#EFF6FF', paddingVertical: 6, paddingHorizontal: 12, borderRadius: 12, gap: 4 },
  btnInviteText: { color: '#2563EB', fontWeight: '800', fontSize: 12 },
  emptyBox: { alignItems: 'center', padding: 20, gap: 4 },
  emptyTitle: { fontSize: 14, fontWeight: '700', color: '#475569' },
  emptySub: { fontSize: 12, color: '#94A3B8', textAlign: 'center' },
  petsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  petItemCard: { width: '48%', backgroundColor: '#F8FAFC', padding: 14, borderRadius: 18, alignItems: 'center', borderWidth: 1, borderColor: '#E2E8F0' },
  petItemAvatar: { width: 52, height: 52, borderRadius: 26, backgroundColor: '#EFF6FF', justifyContent: 'center', alignItems: 'center', overflow: 'hidden', marginBottom: 8 },
  petItemName: { fontSize: 14, fontWeight: '800', color: '#1E293B' },
  petItemBreed: { fontSize: 11, color: '#64748B', marginTop: 2, marginBottom: 8 },
  petItemBadge: { backgroundColor: '#E2E8F0', paddingVertical: 3, paddingHorizontal: 8, borderRadius: 8 },
  petItemBadgeText: { fontSize: 10, fontWeight: '700', color: '#475569' },
  taskListItem: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F8FAFC', padding: 12, borderRadius: 14, borderWidth: 1, borderColor: '#E2E8F0', gap: 10 },
  taskIconBox: { width: 28, height: 28, borderRadius: 14, backgroundColor: '#EFF6FF', justifyContent: 'center', alignItems: 'center' },
  taskListTitle: { fontSize: 13, fontWeight: '700', color: '#1E293B' },
  taskListPet: { fontSize: 11, color: '#64748B', marginTop: 2 },
  caregiverCard: { flexDirection: 'row', alignItems: 'center', paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#F1F5F9', gap: 12 },
  caregiverAvatar: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#EFF6FF', justifyContent: 'center', alignItems: 'center' },
  caregiverInitials: { fontSize: 14, fontWeight: '800', color: '#2563EB' },
  caregiverName: { fontSize: 14, fontWeight: '700', color: '#1E293B' },
  caregiverRole: { fontSize: 11, color: '#64748B', marginTop: 2 },
  roleBadge: { backgroundColor: '#EFF6FF', paddingVertical: 3, paddingHorizontal: 8, borderRadius: 8 },
  roleBadgeText: { fontSize: 10, fontWeight: '700', color: '#2563EB' },
  modalOverlay: { position: 'absolute', top: 0, bottom: 0, left: 0, right: 0, backgroundColor: 'rgba(15, 23, 42, 0.55)', justifyContent: 'center', padding: 20, zIndex: 999 },
  modalCard: { backgroundColor: '#FFFFFF', borderRadius: 24, padding: 22, elevation: 10 },
  modalTitle: { fontSize: 18, fontWeight: '900', color: '#0F172A', marginBottom: 4, textAlign: 'center' },
  modalSub: { fontSize: 12, color: '#64748B', textAlign: 'center', marginBottom: 14 },
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