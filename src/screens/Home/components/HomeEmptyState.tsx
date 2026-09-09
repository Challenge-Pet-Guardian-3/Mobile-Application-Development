import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, RefreshControl, StyleSheet, Platform } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Header } from '../../../components/Header';
import { colors, spacing } from '../../../constants/theme';
import { shadows } from '../../../utils/shadow';
import { useHomeData } from '../../../hooks/useHomeData';

interface HomeEmptyStateProps {
  status: ReturnType<typeof useHomeData>['status'];
  onNavigateToFamily: () => void;
}

export function HomeEmptyState({ status, onNavigateToFamily }: HomeEmptyStateProps) {
  const isRefreshing = status.isFetching && !status.isLoading;

  return (
    <View style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={status.refetch}
            tintColor={colors.success.default}
          />
        }
      >
        <Header subtitle="Visão Geral do Cuidado" />
        <View style={styles.emptyCard}>
          <View style={styles.iconCircle}>
            <MaterialCommunityIcons name="dog" size={48} color={colors.success.default} />
          </View>
          <Text style={styles.title}>Nenhum Pet Cadastrado</Text>
          <Text style={styles.text}>
            Cadastre seu primeiro pet na aba Family Pet para desbloquear a rotina de cuidados e o score de bem-estar.
          </Text>
          <TouchableOpacity
            style={[styles.button, { backgroundColor: colors.success.default }]}
            onPress={onNavigateToFamily}
            activeOpacity={0.8}
          >
            <Text style={styles.buttonText}>Cadastrar Pet na Family</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
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
  emptyCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 28,
    alignItems: 'center',
    elevation: 2,
    marginTop: 20,
    borderWidth: 1,
    borderColor: 'rgba(226, 232, 240, 0.8)',
    ...shadows.sm,
  },
  iconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#F8FAFC',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0F172A',
    marginTop: 8,
    textAlign: 'center',
  },
  text: {
    fontSize: 13,
    color: '#64748B',
    textAlign: 'center',
    marginTop: 6,
    lineHeight: 18,
  },
  button: {
    width: '100%',
    paddingVertical: 14,
    borderRadius: 16,
    alignItems: 'center',
    marginTop: 20,
  },
  buttonText: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 15,
  },
});
