import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { View, StyleSheet, ScrollView, Platform, RefreshControl } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../routes/types';
import { colors, spacing } from '../../constants/theme';
import { Header } from '../../components/Header';
import { LoadingSpinner } from '../../components/LoadingSpinner';
import { useHomeData } from '../../hooks/useHomeData';
import { HomePetSelector } from './components/HomePetSelector';
import { HomeScoreBar } from './components/HomeScoreBar';
import { HomeRoutineSection } from './components/HomeRoutineSection';
import { HomeAiShortcut } from './components/HomeAiShortcut';
import { HomeTaskModal } from './components/HomeTaskModal';
import { HomeEmptyState } from './components/HomeEmptyState';
import { HomeErrorState } from './components/HomeErrorState';

interface HomeScreenProps {
  navigation: NativeStackNavigationProp<RootStackParamList>;
}

export default function Home({ navigation }: HomeScreenProps) {
  const { status, pets, routine, taskModal, navigation: nav } = useHomeData(navigation);

  if (status.isLoading && (pets?.list?.length ?? 0) === 0) {
    return <LoadingSpinner message="Carregando dados do PetGuardian..." />;
  }

  if (status.isError && (pets?.list?.length ?? 0) === 0) {
    return (
      <>
        <HomeErrorState status={status} />
        <StatusBar style="dark" />
      </>
    );
  }

  if ((pets?.list?.length ?? 0) === 0) {
    return (
      <>
        <HomeEmptyState status={status} onNavigateToFamily={nav.toFamily} />
        <StatusBar style="dark" />
      </>
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
        <HomePetSelector pets={pets} />

        {/* Barra de Score e Bem-Estar do Pet Ativo */}
        <HomeScoreBar pets={pets} routine={routine} onPress={nav.toPetDetail} />

        {/* Ofensiva Familiar e Tarefas da Rotina */}
        <HomeRoutineSection
          routine={routine}
          onManagePress={nav.toFamily}
        />

        {/* Atalho Rápido para a IA Assistente Preventiva */}
        <HomeAiShortcut onPress={nav.toAi} />

        <View style={{ height: 110 }} />
      </ScrollView>

      {/* Modal de Edição Rápida de Tarefa */}
      <HomeTaskModal taskModal={taskModal} pets={pets} />

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
});