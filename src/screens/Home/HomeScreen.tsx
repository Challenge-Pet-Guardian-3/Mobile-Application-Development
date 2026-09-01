import React, { useState, useCallback, useMemo } from 'react';
import { StatusBar } from 'expo-status-bar';
import {
  Text,
  View,
  Image,
  StyleSheet,
  ScrollView,
  Platform,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
import { Header } from '../../components/Header';
import { PetScoreBar } from '../../components/PetScoreBar';
import { RoutineCard } from '../../components/RoutineCard';
import { StreakCard } from '../../components/streakCard';
import { EmptyState } from '../../components/EmptyState';
import { LoadingSpinner } from '../../components/LoadingSpinner';
import { getAvatarById } from '../../constants/Avatares';

import { useSession } from '../../hooks/useSession';
import { usePets } from '../../hooks/usePets';
import { useTasks, useCompleteTask, useDeleteTask } from '../../hooks/useTasks';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { PetResponse } from '../../types/pet';
import { TarefaResponse } from '../../types/task';

interface HomeScreenProps {
  navigation: NativeStackNavigationProp<any>;
}

export default function Home({ navigation }: HomeScreenProps) {
  const { user } = useSession();

  // Estados locais da Home
  const [selectedPetId, setSelectedPetId] = useState<number | null>(null);

  // Queries e Mutações com TanStack Query
  const { data: petsData, isLoading: isLoadingPets } = usePets();
  const { data: tasksData } = useTasks();

  const completeTaskMutation = useCompleteTask();
  const deleteTaskMutation = useDeleteTask();

  const pets: PetResponse[] = petsData?.content || [];
  const allTasks: TarefaResponse[] = tasksData?.content || [];

  // Pet ativo atual
  const activePet: PetResponse | undefined = useMemo(() => {
    if (pets.length === 0) return undefined;
    if (selectedPetId !== null) {
      const found = pets.find((p) => p.id === selectedPetId);
      if (found) return found;
    }
    return pets[0];
  }, [pets, selectedPetId]);

  // Filtrar tarefas vinculadas ao pet ativo
  const tarefasDoPet = useMemo(() => {
    if (!activePet) return [];
    return allTasks.filter((t) => t.petId === activePet.id);
  }, [allTasks, activePet]);

  // Cálculo de score e progresso do pet
  const tarefasConcluidas = tarefasDoPet.filter((t) => t.status === 'CONCLUIDO');
  const petScore = useMemo(() => {
    const pontosBase = tarefasConcluidas.reduce((acc, t) => acc + (t.pontosTarefa || 10), 0);
    return Math.min(pontosBase, 100);
  }, [tarefasConcluidas]);

  // Handlers de navegação
  const handleNavigateToFamily = useCallback(() => {
    navigation.navigate('Family');
  }, [navigation]);

  const handleNavigateToPetDetail = useCallback(() => {
    navigation.navigate('Family', { screen: 'PetDetail', params: { petId: activePet?.id } });
  }, [navigation, activePet]);

  const handleNavigateToAi = useCallback(() => {
    navigation.navigate('IA');
  }, [navigation]);

  const handleNavigateToClinics = useCallback(() => {
    navigation.navigate('Perfil', { screen: 'Clinicas' });
  }, [navigation]);

  // Ação de alternar status da tarefa
  const handleToggleTask = useCallback(
    async (taskId: number) => {
      if (!user) return;
      try {
        await completeTaskMutation.mutateAsync({
          id: taskId,
          request: { concluinteId: user.id },
        });
      } catch {
        Alert.alert('Aviso', 'Não foi possível atualizar o status da tarefa.');
      }
    },
    [user, completeTaskMutation]
  );

  // Ação de deletar tarefa
  const handleDeleteTask = useCallback(
    (taskId: number) => {
      Alert.alert('Remover Tarefa', 'Deseja realmente remover esta rotina do pet?', [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Excluir',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteTaskMutation.mutateAsync(taskId);
            } catch {
              Alert.alert('Erro', 'Não foi possível excluir a tarefa.');
            }
          },
        },
      ]);
    },
    [deleteTaskMutation]
  );

  if (isLoadingPets && pets.length === 0) {
    return <LoadingSpinner message="Carregando dados do PetGuardian..." />;
  }

  // Se não houver pets cadastrados
  if (pets.length === 0) {
    return (
      <View style={styles.container}>
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
          <Header subtitle="Visão Geral do Cuidado" />
          <EmptyState
            iconName="dog"
            iconColor="#10B981"
            title="Nenhum Pet Cadastrado"
            description="Cadastre seu primeiro pet na aba Family Pet para desbloquear a rotina de cuidados e o score de bem-estar."
            buttonText="Cadastrar Pet na Family"
            buttonColor="#10B981"
            onButtonPress={handleNavigateToFamily}
          />
        </ScrollView>
        <StatusBar style="dark" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        <Header subtitle="Painel de Saúde e Rotina" />

        {/* Seletor Horizontal de Pets Ativos */}
        <View style={styles.petSelectorContainer}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.petsScroll}>
            {pets.map((pet) => {
              const isSelected = activePet?.id === pet.id;
              const avatar = getAvatarById(pet.avatarId);
              return (
                <TouchableOpacity
                  key={pet.id}
                  style={[styles.petPill, isSelected && styles.petPillSelected]}
                  onPress={() => setSelectedPetId(pet.id)}
                  activeOpacity={0.8}
                >
                  <View style={[styles.petAvatarWrapper, isSelected && styles.petAvatarWrapperSelected]}>
                    {avatar ? (
                      <Image source={avatar} style={styles.petAvatarImg} />
                    ) : (
                      <MaterialCommunityIcons name="paw" size={18} color={isSelected ? '#FFFFFF' : '#64748B'} />
                    )}
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.petPillName, isSelected && styles.petPillNameSelected]} numberOfLines={1}>
                      {pet.nome}
                    </Text>
                    <Text style={[styles.petPillBreed, isSelected && styles.petPillBreedSelected]} numberOfLines={1}>
                      {pet.raca || 'Pet'}
                    </Text>
                  </View>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>

        {/* Barra de Score e Bem-Estar do Pet Ativo */}
        {activePet && (
          <TouchableOpacity activeOpacity={0.9} onPress={handleNavigateToPetDetail}>
            <PetScoreBar
              score={petScore}
              maxScore={100}
              petName={activePet.nome}
              level={Math.max(1, Math.floor(petScore / 25) + 1)}
            />
          </TouchableOpacity>
        )}

        {/* Ofensiva Familiar */}
        <StreakCard totalStreak={Math.max(1, tarefasConcluidas.length)} />

        {/* Seção de Tarefas da Rotina */}
        <View style={styles.tasksSection}>
          <View style={styles.sectionHeader}>
            <View>
              <Text style={styles.sectionTitle}>Rotina de Hoje</Text>
              <Text style={styles.sectionSubtitle}>
                {tarefasConcluidas.length} de {tarefasDoPet.length} concluídas hoje
              </Text>
            </View>
            <TouchableOpacity style={styles.btnGerenciarTarefas} onPress={handleNavigateToFamily}>
              <Text style={styles.btnGerenciarTarefasText}>Gerenciar na Family</Text>
              <Ionicons name="chevron-forward" size={14} color="#2563EB" />
            </TouchableOpacity>
          </View>

          {tarefasDoPet.length === 0 ? (
            <View style={styles.emptyTasksBox}>
              <MaterialCommunityIcons name="clipboard-check-outline" size={32} color="#CBD5E1" />
              <Text style={styles.emptyTasksTitle}>Tudo em dia para hoje!</Text>
              <Text style={styles.emptyTasksDesc}>Crie novas tarefas para seu pet na aba Family Pet.</Text>
            </View>
          ) : (
            tarefasDoPet.map((tarefa) => (
              <RoutineCard
                key={tarefa.id}
                tarefa={tarefa}
                onToggle={handleToggleTask}
                onDelete={handleDeleteTask}
              />
            ))
          )}
        </View>

        {/* Atalhos Rápidos no Final da Página (IA Assistente e Clínicas 24h) */}
        <View style={styles.shortcutsRow}>
          <TouchableOpacity style={styles.shortcutCard} onPress={handleNavigateToAi} activeOpacity={0.85}>
            <View style={[styles.shortcutIconBox, { backgroundColor: '#EFF6FF' }]}>
              <MaterialCommunityIcons name="robot-outline" size={20} color="#2563EB" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.shortcutTitle} numberOfLines={1}>IA Assistente</Text>
              <Text style={styles.shortcutSub} numberOfLines={1}>Dicas e saúde</Text>
            </View>
            <Ionicons name="arrow-forward" size={14} color="#94A3B8" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.shortcutCard} onPress={handleNavigateToClinics} activeOpacity={0.85}>
            <View style={[styles.shortcutIconBox, { backgroundColor: '#FEF2F2' }]}>
              <MaterialCommunityIcons name="hospital-box-outline" size={20} color="#EF4444" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.shortcutTitle} numberOfLines={1}>Clínicas 24h</Text>
              <Text style={styles.shortcutSub} numberOfLines={1}>Emergências</Text>
            </View>
            <Ionicons name="arrow-forward" size={14} color="#94A3B8" />
          </TouchableOpacity>
        </View>

        <View style={{ height: 110 }} />
      </ScrollView>

      <StatusBar style="dark" />
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
  petSelectorContainer: {
    marginBottom: 4,
  },
  petsScroll: {
    gap: 10,
    paddingVertical: 2,
  },
  petPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: 'rgba(226, 232, 240, 0.8)',
    gap: 10,
    minWidth: 140,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.02,
    shadowRadius: 6,
    elevation: 1,
  },
  petPillSelected: {
    backgroundColor: '#0F172A',
    borderColor: '#0F172A',
  },
  petAvatarWrapper: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  petAvatarWrapperSelected: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  petAvatarImg: {
    width: '100%',
    height: '100%',
  },
  petPillName: {
    fontSize: 13,
    fontWeight: '800',
    color: '#1E293B',
  },
  petPillNameSelected: {
    color: '#FFFFFF',
  },
  petPillBreed: {
    fontSize: 11,
    color: '#64748B',
  },
  petPillBreedSelected: {
    color: 'rgba(255, 255, 255, 0.7)',
  },
  shortcutsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  shortcutCard: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(226, 232, 240, 0.8)',
    gap: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.02,
    shadowRadius: 6,
    elevation: 1,
  },
  shortcutIconBox: {
    width: 38,
    height: 38,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  shortcutTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#0F172A',
  },
  shortcutSub: {
    fontSize: 11,
    color: '#64748B',
  },
  tasksSection: {
    gap: 10,
    marginTop: 4,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: '#0F172A',
  },
  sectionSubtitle: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 1,
  },
  btnGerenciarTarefas: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  btnGerenciarTarefasText: {
    color: '#2563EB',
    fontWeight: '700',
    fontSize: 12,
  },
  emptyTasksBox: {
    backgroundColor: '#FFFFFF',
    padding: 24,
    borderRadius: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(226, 232, 240, 0.8)',
    gap: 6,
  },
  emptyTasksTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#334155',
  },
  emptyTasksDesc: {
    fontSize: 12,
    color: '#94A3B8',
    textAlign: 'center',
  },
});