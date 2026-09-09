import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { PetPontuacaoResponse } from '../../../types/pet';
import { shadows } from '../../../utils/shadow';
import { LoadingSpinner } from '../../../components/LoadingSpinner';
import { colors, spacing, borderRadius } from '../../../constants/theme';

export interface PetPointsCardProps {
  pontos?: PetPontuacaoResponse;
  isLoading?: boolean;
}

export function PetPointsCard({ pontos, isLoading = false }: PetPointsCardProps) {
  if (isLoading && !pontos) {
    return (
      <View style={styles.pointsCard}>
        <LoadingSpinner message="Buscando pontuação do pet..." size="small" />
      </View>
    );
  }

  const pontosTotais = pontos?.pontosTotais ?? 0;
  const pontosTarefas = pontos?.pontosTarefas ?? 0;
  const pontosAulas = pontos?.pontosAulas ?? 0;

  return (
    <View style={styles.pointsCard}>
      <View style={styles.pointsHeader}>
        <View style={styles.headerTitleRow}>
          <MaterialCommunityIcons name="star-circle-outline" size={20} color={colors.primary[600]} />
          <Text style={styles.pointsTitle}>Pontuação do Pet</Text>
        </View>

        <View style={styles.totalBadge}>
          <MaterialCommunityIcons name="star" size={14} color={colors.warning[600]} />
          <Text style={styles.totalBadgeText}>{pontosTotais} XP</Text>
        </View>
      </View>

      <View style={styles.statsRow}>
        <View style={styles.statBox}>
          <View style={[styles.iconBox, { backgroundColor: colors.primary[50] }]}>
            <MaterialCommunityIcons name="clipboard-check-outline" size={18} color={colors.primary[600]} />
          </View>
          <Text style={styles.statValue}>+{pontosTarefas} pts</Text>
          <Text style={styles.statLabel}>Tarefas da Rotina</Text>
        </View>

        <View style={styles.statBox}>
          <View style={[styles.iconBox, { backgroundColor: colors.success[50] }]}>
            <MaterialCommunityIcons name="school-outline" size={18} color={colors.success[500]} />
          </View>
          <Text style={styles.statValue}>+{pontosAulas} pts</Text>
          <Text style={styles.statLabel}>Aulas & Treinos</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  pointsCard: {
    backgroundColor: colors.neutral.white,
    borderRadius: borderRadius.xxl,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.neutral[200],
    ...shadows.sm,
    marginBottom: spacing.md,
  },
  pointsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  headerTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  pointsTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.neutral[900],
  },
  totalBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.warning[100],
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: borderRadius.md,
    gap: 4,
  },
  totalBadgeText: {
    fontSize: 13,
    fontWeight: '800',
    color: colors.warning[700],
  },
  statsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  statBox: {
    flex: 1,
    backgroundColor: colors.neutral[50],
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.neutral[200],
  },
  iconBox: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  statValue: {
    fontSize: 15,
    fontWeight: '800',
    color: colors.neutral[900],
    marginBottom: 2,
  },
  statLabel: {
    fontSize: 11,
    color: colors.neutral[500],
    fontWeight: '600',
    textAlign: 'center',
  },
});
