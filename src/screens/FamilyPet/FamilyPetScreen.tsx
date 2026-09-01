import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Platform,
  Alert,
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { Header } from '../../components/Header';
import { LoadingSpinner } from '../../components/LoadingSpinner';
import { PetFormModal, PetFormData } from '../../components/PetFormModal';
import { TaskFormModal, TaskFormData } from '../../components/TaskFormModal';
import { InviteCaregiverModal, InviteCaregiverData } from '../../components/InviteCaregiverModal';
import { PetCard } from '../../components/PetCard';
import { CaregiverCard } from '../../components/CaregiverCard';

import { useSession } from '../../hooks/useSession';
import { usePets, useCreatePet, useInviteCaregiver } from '../../hooks/usePets';
import { useTasks, useCreateTask, useDeleteTask } from '../../hooks/useTasks';
import { useRedeCuidado } from '../../hooks/useRedeCuidado';
import { PetResponse } from '../../types/pet';
import { TarefaResponse } from '../../types/task';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { normalizarDataNascParaIso } from '../../utils/petUtils';

interface FamilyPetScreenProps {
  navigation: NativeStackNavigationProp<any>;
}

export default function FamilyPetScreen({ navigation }: FamilyPetScreenProps) {
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

  // Salvar Novo Pet na API Java (POST /pets)
  const handleCadastrarPet = useCallback(async (formPet: PetFormData) => {
    if (!user) return;
    if (!formPet.nome.trim() || !formPet.raca.trim()) {
      Alert.alert('Campos obrigatórios', 'Por favor, informe o nome e a raça do pet.');
      return;
    }

    const dataNasc = normalizarDataNascParaIso(formPet.dataNasc);

    try {
      await createPetMutation.mutateAsync({
        nome: formPet.nome.trim(),
        dataNasc,
        raca: formPet.raca.trim(),
        porte: formPet.porte,
        sexo: formPet.sexo,
        castrado: formPet.castrado,
        usuarioId: user.id,
      });

      setModalNovoPet(false);
      Alert.alert('Sucesso!', 'Novo pet cadastrado na família com sucesso!');
    } catch {
      Alert.alert('Erro', 'Não foi possível cadastrar o pet na API Java.');
    }
  }, [user, createPetMutation]);

  // Salvar Nova Tarefa para o Pet na API Java (POST /tarefas)
  const handleCadastrarTarefa = useCallback(async (data: TaskFormData) => {
    if (!user) return;

    try {
      const prazoData = new Date();
      prazoData.setHours(23, 59, 0, 0);

      await createTaskMutation.mutateAsync({
        titulo: data.titulo,
        descricao: data.descricao || 'Cuidado diário da família',
        pontosTarefa: Number(data.pontos) || 15,
        prazo: prazoData.toISOString(),
        usuarioId: null,
        petId: data.petId,
        status: 'PENDENTE',
      });

      setModalNovaTarefa(false);
      Alert.alert('Sucesso!', 'Tarefa criada para a rotina do pet!');
    } catch {
      Alert.alert('Erro', 'Não foi possível cadastrar a tarefa na API Java.');
    }
  }, [user, createTaskMutation]);

  // Enviar convite de co-cuidador (POST /pets/{id}/cuidadores)
  const handleEnviarConvite = useCallback(async (data: InviteCaregiverData) => {
    if (!user) return;

    try {
      await inviteMutation.mutateAsync({
        petId: data.petId,
        responsavelPrincipalId: user.id,
        email: data.email.toLowerCase(),
      });
      setModalConvite(false);
      Alert.alert('Convite Enviado!', 'O cuidador foi vinculado à rede de cuidados do pet.');
    } catch {
      Alert.alert('Erro', 'Não foi possível enviar o convite.');
    }
  }, [user, inviteMutation]);

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
              {pets.map((pet) => (
                <PetCard
                  key={pet.id}
                  pet={pet}
                  onPress={() => navigation.navigate('PetDetail', { petId: pet.id })}
                />
              ))}
            </View>
          )}
        </View>

        {/* Seção de Tarefas da Rotina */}
        <View style={styles.sectionBox}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Rotina & Tarefas</Text>
            <TouchableOpacity
              style={styles.btnAddTask}
              onPress={() => setModalNovaTarefa(true)}
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
              onPress={() => setModalConvite(true)}
            >
              <Ionicons name="person-add" size={14} color="#2563EB" />
              <Text style={styles.btnInviteText}>Convidar</Text>
            </TouchableOpacity>
          </View>

          {/* Meu perfil */}
          {user && (
            <CaregiverCard
              nome={user.nome || 'Tutor'}
              roleText="Responsável Principal"
              isCurrentUser
              isPrincipal
            />
          )}

          {/* Co-cuidadores */}
          {coCuidadores.map((c) => (
            <CaregiverCard
              key={c.id}
              nome={c.nome}
              email={c.email}
              isPrincipal={false}
            />
          ))}
        </View>

        <View style={{ height: 110 }} />
      </ScrollView>

      {/* Modal de Cadastro de Pet Reutilizável */}
      <PetFormModal
        visible={modalNovoPet}
        onClose={() => setModalNovoPet(false)}
        mode="create"
        isLoading={createPetMutation.isPending}
        onSubmit={handleCadastrarPet}
      />

      {/* Modal de Criação de Tarefa Reutilizável */}
      <TaskFormModal
        visible={modalNovaTarefa}
        onClose={() => setModalNovaTarefa(false)}
        pets={pets}
        isLoading={createTaskMutation.isPending}
        onSubmit={handleCadastrarTarefa}
      />

      {/* Modal de Convidar Co-Cuidador Reutilizável */}
      <InviteCaregiverModal
        visible={modalConvite}
        onClose={() => setModalConvite(false)}
        pets={pets}
        isLoading={inviteMutation.isPending}
        onSubmit={handleEnviarConvite}
      />
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
  btnAddPet: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#10B981', paddingVertical: 6, paddingHorizontal: 12, borderRadius: 12, gap: 4 },
  btnAddPetText: { color: '#FFFFFF', fontWeight: '800', fontSize: 12 },
  btnAddTask: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#10B981', paddingVertical: 6, paddingHorizontal: 12, borderRadius: 12, gap: 4 },
  btnAddTaskText: { color: '#FFFFFF', fontWeight: '800', fontSize: 12 },
  btnInvite: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#EFF6FF', paddingVertical: 6, paddingHorizontal: 12, borderRadius: 12, gap: 4 },
  btnInviteText: { color: '#2563EB', fontWeight: '800', fontSize: 12 },
  emptyBox: { alignItems: 'center', padding: 20, gap: 4 },
  emptyTitle: { fontSize: 14, fontWeight: '700', color: '#475569' },
  emptySub: { fontSize: 12, color: '#94A3B8', textAlign: 'center' },
  petsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  taskListItem: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F8FAFC', padding: 12, borderRadius: 14, borderWidth: 1, borderColor: '#E2E8F0', gap: 10 },
  taskIconBox: { width: 28, height: 28, borderRadius: 14, backgroundColor: '#EFF6FF', justifyContent: 'center', alignItems: 'center' },
  taskListTitle: { fontSize: 13, fontWeight: '700', color: '#1E293B' },
  taskListPet: { fontSize: 11, color: '#64748B', marginTop: 2 },
});