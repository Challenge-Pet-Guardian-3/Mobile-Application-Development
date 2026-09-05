import React, { useState, useCallback } from 'react';
import { StatusBar } from 'expo-status-bar';
import {
  Text,
  View,
  Image,
  StyleSheet,
  ScrollView,
  Platform,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
import { Header } from '../../components/Header';
import { PetScoreBar } from '../../components/PetScoreBar';
import { RoutineCard } from '../../components/RoutineCard';
import { StreakCard } from '../../components/streakCard';
import { EmptyState } from '../../components/EmptyState';
import { LoadingSpinner } from '../../components/LoadingSpinner';
import { ErrorState } from '../../components/ErrorState';
import { TaskFormModal } from '../../components/TaskFormModal';
import { TarefaResponse } from '../../types/task';
import { shadows } from '../../utils/shadow';
import { useHomeData } from '../../hooks/useHomeData';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../routes/types';

interface HomeScreenProps {
  navigation: NativeStackNavigationProp<RootStackParamList>;
}

export default function Home({ navigation }: HomeScreenProps) {
  const {
    pets,
    isLoadingPets,
    isFetching,
    isError,
    error,
    refetch,
    selectedPetId,
    setSelectedPetId,
    activePet,
    tarefasDoPet,
    tarefasConcluidas,
    petScore,
    alternarStatusTarefa,
    atualizarTarefa,
    excluirTarefaComConfirmacao,
    isUpdatingTask,
  } = useHomeData();

  const [tarefaEmEdicao, setTarefaEmEdicao] = useState<TarefaResponse | null>(null);

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

  if (isLoadingPets && pets.length === 0) {
    return <LoadingSpinner message="Carregando dados do PetGuardian..." />;
  }

  if (isError && pets.length === 0) {
    return (
      <View style={styles.container}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
          refreshControl={
            <RefreshControl
              refreshing={isFetching && !isLoadingPets}
              onRefresh={refetch}
              tintColor="#10B981"
            />
          }
        >
          <Header subtitle="Visão Geral do Cuidado" />
          <ErrorState
            message={error?.message || 'Não foi possível carregar os dados do painel.'}
            onRetry={refetch}
          />
        </ScrollView>
        <StatusBar style="dark" />
      </View>
    );
  }

  // Se não houver pets cadastrados
  if (pets.length === 0) {
    return (
      <View style={styles.container}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
          refreshControl={
            <RefreshControl
              refreshing={isFetching && !isLoadingPets}
              onRefresh={refetch}
              tintColor="#10B981"
            />
          }
        >
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
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={isFetching && !isLoadingPets}
            onRefresh={refetch}
            tintColor="#10B981"
          />
        }
      >
        <Header subtitle="Painel de Saúde e Rotina" />

        {/* Seletor Horizontal de Pets Ativos */}
        <View style={styles.petSelectorContainer}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.petsScroll}>
            {pets.map((pet) => {
              const isSelected = activePet?.id === pet.id;
              return (
                <TouchableOpacity
                  key={pet.id}
                  style={[styles.petPill, isSelected && styles.petPillSelected]}
                  onPress={() => setSelectedPetId(pet.id)}
                  activeOpacity={0.8}
                >
                  <View style={[styles.petAvatarWrapper, isSelected && styles.petAvatarWrapperSelected]}>
                    <MaterialCommunityIcons name="paw" size={18} color={isSelected ? '#FFFFFF' : '#64748B'} />
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
              petName={activePet.nome}
              tarefasConcluidas={tarefasConcluidas.length}
              totalTarefas={tarefasDoPet.length}
            />
          </TouchableOpacity>
        )}

        {/* Ofensiva Familiar */}
        <StreakCard totalStreak={tarefasConcluidas.length} />

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
                onToggle={alternarStatusTarefa}
                onEdit={setTarefaEmEdicao}
                onDelete={excluirTarefaComConfirmacao}
              />
            ))
          )}
        </View>

        {/* Atalho Rápido para a IA Assistente Preventiva */}
        <TouchableOpacity style={styles.shortcutCard} onPress={handleNavigateToAi} activeOpacity={0.85}>
          <View style={[styles.shortcutIconBox, { backgroundColor: '#EFF6FF' }]}>
            <MaterialCommunityIcons name="robot-outline" size={22} color="#2563EB" />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.shortcutTitle}>IA Assistente Preventiva</Text>
            <Text style={styles.shortcutSub}>Orientações contextuais de saúde, nutrição e rotina do pet</Text>
          </View>
          <Ionicons name="arrow-forward" size={16} color="#2563EB" />
        </TouchableOpacity>

        <View style={{ height: 110 }} />
      </ScrollView>

      {/* Modal de Edição Rápida de Tarefa */}
      <TaskFormModal
        visible={!!tarefaEmEdicao}
        onClose={() => setTarefaEmEdicao(null)}
        mode="edit"
        pets={pets}
        isLoading={isUpdatingTask}
        initialData={
          tarefaEmEdicao
            ? {
                petId: tarefaEmEdicao.petId,
                titulo: tarefaEmEdicao.titulo,
                descricao: tarefaEmEdicao.descricao,
                pontos: String(tarefaEmEdicao.pontosTarefa),
              }
            : null
        }
        onSubmit={(data) => {
          if (tarefaEmEdicao) {
            atualizarTarefa(tarefaEmEdicao.id, data, {
              onSuccess: () => setTarefaEmEdicao(null),
            });
          }
        }}
      />

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
    ...shadows.xs,
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
  shortcutCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: 'rgba(226, 232, 240, 0.8)',
    gap: 12,
    ...shadows.xs,
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