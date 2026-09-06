import React, { memo } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { PetPontuacaoResponse } from '../../types/pet';
import { shadows } from '../../utils/shadow';
import { colors, spacing, borderRadius } from '../../constants/theme';

export interface PetPointsCardProps {
  pontos?: PetPontuacaoResponse;
  isLoading?: boolean;
  petName?: string;
}

interface PointsCategoryItem {
  key: string;
  title: string;
  desc: string;
  points: number;
  icon: keyof typeof MaterialCommunityIcons.glyphMap;
  iconBg: string;
  iconColor: string;
  pointsColor: string;
}

export const PetPointsCard = memo(function PetPointsCard({
  pontos,
  isLoading = false,
  petName = 'Pet',
}: PetPointsCardProps) {
  if (isLoading && !pontos) {
    return (
      <View style={styles.card} accessible={true} accessibilityRole="progressbar" accessibilityLabel={`Carregando pontuação de ${petName}`}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="small" color={colors.primary[600]} />
          <Text style={styles.loadingText}>Carregando pontuação de {petName}...</Text>
        </View>
      </View>
    );
  }

  const pontosTotais = pontos?.pontosTotais ?? 0;
  const pontosTarefas = pontos?.pontosTarefas ?? 0;
  const pontosAulas = pontos?.pontosAulas ?? 0;

  const categories: PointsCategoryItem[] = [
    {
      key: 'tarefas',
      title: 'Tarefas da Rotina',
      desc: 'Cuidados e saúde diária',
      points: pontosTarefas,
      icon: 'clipboard-check-outline',
      iconBg: colors.primary[50],
      iconColor: colors.primary[600],
      pointsColor: colors.primary[700],
    },
    {
      key: 'aulas',
      title: 'Aulas e Treinos',
      desc: 'Trilhas e adestramento',
      points: pontosAulas,
      icon: 'school-outline',
      iconBg: colors.success[50],
      iconColor: colors.success[600],
      pointsColor: colors.success[700],
    },
  ];

  const accessibilityCardLabel = `Painel de pontuação de ${petName}. Total: ${pontosTotais} pontos. Tarefas da rotina: ${pontosTarefas} pontos. Aulas e treinos: ${pontosAulas} pontos.`;

  return (
    <View style={styles.card} accessible={true} accessibilityRole="summary" accessibilityLabel={accessibilityCardLabel}>
      {/* Topo: Título e Pontos Totais */}
      <View style={styles.headerRow}>
        <View style={styles.headerLeft}>
          <View style={styles.iconBadge}>
            <MaterialCommunityIcons name="star-circle-outline" size={24} color={colors.warning[600]} />
          </View>
          <View>
            <Text style={styles.title}>Pontuação de {petName}</Text>
            <Text style={styles.subtitle}>Pontos acumulados em rotina e treinos</Text>
          </View>
        </View>

        <View style={styles.totalPointsBadge}>
          <MaterialCommunityIcons name="star" size={14} color={colors.warning[600]} />
          <Text style={styles.totalPointsText}>{pontosTotais} Pontos</Text>
        </View>
      </View>

      {/* Detalhamento dos Pontos (Tarefas + Aulas) */}
      <View style={styles.breakdownRow}>
        {categories.map((cat) => (
          <View key={cat.key} style={styles.breakdownCard}>
            <View style={styles.breakdownHeader}>
              <View style={[styles.breakdownIconWrapper, { backgroundColor: cat.iconBg }]}>
                <MaterialCommunityIcons name={cat.icon} size={18} color={cat.iconColor} />
              </View>
              <Text style={[styles.breakdownPoints, { color: cat.pointsColor }]}>
                +{cat.points} pts
              </Text>
            </View>
            <Text style={styles.breakdownTitle}>{cat.title}</Text>
            <Text style={styles.breakdownDesc}>{cat.desc}</Text>
          </View>
        ))}
      </View>
    </View>
  );
});

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.neutral.white,
    borderRadius: borderRadius.xxl,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: 'rgba(226, 232, 240, 0.8)',
    ...shadows.sm,
    elevation: 2,
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.md,
  },
  loadingText: {
    fontSize: 13,
    color: colors.neutral[500],
    fontWeight: '600',
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  iconBadge: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.warning[50],
    borderWidth: 1,
    borderColor: colors.warning[200],
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 15,
    fontWeight: '800',
    color: colors.neutral[900],
  },
  subtitle: {
    fontSize: 11,
    color: colors.neutral[500],
    fontWeight: '600',
    marginTop: 2,
  },
  totalPointsBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: colors.warning[50],
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.warning[200],
  },
  totalPointsText: {
    color: colors.warning[700],
    fontWeight: '900',
    fontSize: 13,
  },
  breakdownRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  breakdownCard: {
    flex: 1,
    backgroundColor: colors.neutral[50],
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.neutral[200],
  },
  breakdownHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  breakdownIconWrapper: {
    width: 30,
    height: 30,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
  },
  breakdownPoints: {
    fontSize: 12,
    fontWeight: '800',
  },
  breakdownTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: colors.neutral[800],
  },
  breakdownDesc: {
    fontSize: 10,
    color: colors.neutral[400],
    fontWeight: '500',
    marginTop: 2,
  },
});
