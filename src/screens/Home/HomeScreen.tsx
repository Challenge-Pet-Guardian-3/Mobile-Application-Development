import React from 'react';
import { StatusBar } from 'expo-status-bar';
import {
  Text,
  View,
  StyleSheet,
  ScrollView,
  Platform,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
import { Header } from '../../components/Header';
import { PetScoreBar } from '../../components/PetScoreBar';
import { StreakCard } from '../../components/streakCard';
import { EmptyState } from '../../components/EmptyState';
import { LoadingSpinner } from '../../components/LoadingSpinner';
import { ErrorState } from '../../components/ErrorState';
import { TaskFormModal } from '../../components/TaskFormModal';
import { TasksRoutineSection } from '../../components/TasksRoutineSection';
import { shadows } from '../../utils/shadow';
import { useHomeData } from '../../hooks/useHomeData';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../routes/types';
import { colors, spacing, borderRadius } from '../../constants/theme';

interface HomeScreenProps {
  navigation: NativeStackNavigationProp<RootStackParamList>;
}

export default function Home({ navigation }: HomeScreenProps) {
  const { status, pets, routine, taskModal, navigation: nav } = useHomeData(navigation);

  if (status.isLoading && pets.list.length === 0) {
    return <LoadingSpinner message="Carregando dados do PetGuardian..." />;
  }

  if (status.isError && pets.list.length === 0) {
    return (
      <View style={styles.container}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
          refreshControl={
            <RefreshControl
              refreshing={status.isFetching && !status.isLoading}
              onRefresh={status.refetch}
              tintColor={colors.success.default}
            />
          }
        >
          <Header subtitle="Visão Geral do Cuidado" />
          <ErrorState
            message={status.error?.message || 'Não foi possível carregar os dados do painel.'}
            onRetry={status.refetch}
          />
        </ScrollView>
        <StatusBar style="dark" />
      </View>
    );
  }

  // Se não houver pets cadastrados
  if (pets.list.length === 0) {
    return (
      <View style={styles.container}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
          refreshControl={
            <RefreshControl
              refreshing={status.isFetching && !status.isLoading}
              onRefresh={status.refetch}
              tintColor={colors.success.default}
            />
          }
        >
          <Header subtitle="Visão Geral do Cuidado" />
          <EmptyState
            iconName="dog"
            iconColor={colors.success.default}
            title="Nenhum Pet Cadastrado"
            description="Cadastre seu primeiro pet na aba Family Pet para desbloquear a rotina de cuidados e o score de bem-estar."
            buttonText="Cadastrar Pet na Family"
            buttonColor={colors.success.default}
            onButtonPress={nav.toFamily}
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
            refreshing={status.isFetching && !status.isLoading}
            onRefresh={status.refetch}
            tintColor={colors.success.default}
          />
        }
      >
        <Header subtitle="Painel de Saúde e Rotina" />

        {/* Seletor Horizontal de Pets Ativos */}
        <View style={styles.petSelectorContainer}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.petsScroll}>
            {pets.list.map((pet) => {
              const isSelected = pets.active?.id === pet.id;
              return (
                <TouchableOpacity
                  key={pet.id}
                  style={[styles.petPill, isSelected && styles.petPillSelected]}
                  onPress={() => pets.select(pet.id)}
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
        {pets.active && (
          <TouchableOpacity activeOpacity={0.9} onPress={nav.toPetDetail}>
            <PetScoreBar
              score={routine.score}
              petName={pets.active.nome}
              tarefasConcluidas={routine.completedToday.length}
              totalTarefas={routine.activeToday.length}
            />
          </TouchableOpacity>
        )}

        {/* Ofensiva Familiar */}
        <StreakCard
          streakDays={routine.streak.streakDays}
          totalStreak={routine.streak.totalStreak}
        />

        {/* Seção de Tarefas da Rotina Reutilizável */}
        <TasksRoutineSection
          title={routine.current.title}
          subtitle={routine.current.subtitle}
          filter={routine.filter}
          onFilterChange={routine.setFilter}
          countHoje={routine.todayTasks.length}
          countTodas={routine.allPetTasks.length}
          tasks={routine.current.tarefas}
          headerButton={{
            label: 'Gerenciar na Family',
            icon: 'chevron-forward',
            variant: 'link',
            onPress: nav.toFamily,
          }}
          emptyTitle={routine.current.emptyTitle}
          emptyDesc={routine.current.emptyDesc}
          onToggleTask={routine.toggleTask}
          onEditTask={taskModal.openEdit}
          onDeleteTask={taskModal.remove}
        />

        {/* Atalho Rápido para a IA Assistente Preve        {/* Atalho Rápido para a IA Assistente Preventiva */}
        <TouchableOpacity style={styles.shortcutCard} onPress={nav.toAi} activeOpacity={0.85}>
          <View style={[styles.shortcutIconBox, { backgroundColor: colors.primary[50] }]}>
            <MaterialCommunityIcons name="robot-outline" size={22} color={colors.primary[600]} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.shortcutTitle}>IA Assistente Preventiva</Text>
            <Text style={styles.shortcutSub}>Orientações contextuais de saúde, nutrição e rotina do pet</Text>
          </View>
          <Ionicons name="arrow-forward" size={16} color={colors.primary[600]} />
        </TouchableOpacity>

        <View style={{ height: 110 }} />
      </ScrollView>

      {/* Modal de Edição Rápida de Tarefa */}
      <TaskFormModal
        visible={!!taskModal.editingTask}
        onClose={taskModal.close}
        mode="edit"
        pets={pets.list}
        isLoading={taskModal.isUpdating}
        initialData={taskModal.initialData}
        onSubmit={taskModal.submit}
      />

      <StatusBar style="dark" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.neutral[50],
    paddingTop: Platform.OS === 'ios' ? 50 : 25,
  },
  scrollContent: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xs,
    gap: spacing.md,
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
    backgroundColor: colors.neutral.white,
    paddingVertical: spacing.xs,
    paddingHorizontal: 12,
    borderRadius: borderRadius.xl,
    borderWidth: 1,
    borderColor: 'rgba(226, 232, 240, 0.8)',
    gap: 10,
    ...shadows.sm,
  },
  petPillSelected: {
    backgroundColor: colors.neutral[900],
    borderColor: colors.neutral[900],
  },
  petAvatarWrapper: {
    width: 32,
    height: 32,
    borderRadius: borderRadius.md,
    backgroundColor: colors.neutral[100],
    justifyContent: 'center',
    alignItems: 'center',
  },
  petAvatarWrapperSelected: {
    backgroundColor: colors.primary[600],
  },
  petPillName: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.neutral[900],
  },
  petPillNameSelected: {
    color: colors.neutral.white,
  },
  petPillBreed: {
    fontSize: 11,
    color: colors.neutral[500],
    fontWeight: '500',
  },
  petPillBreedSelected: {
    color: colors.neutral[400],
  },
  shortcutCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.neutral.white,
    borderRadius: borderRadius.xxl,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: 'rgba(226, 232, 240, 0.8)',
    gap: 14,
    ...shadows.sm,
  },
  shortcutIconBox: {
    width: 44,
    height: 44,
    borderRadius: borderRadius.lg,
    justifyContent: 'center',
    alignItems: 'center',
  },
  shortcutTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.neutral[900],
  },
  shortcutSub: {
    fontSize: 12,
    color: colors.neutral[500],
    marginTop: 2,
  },
});