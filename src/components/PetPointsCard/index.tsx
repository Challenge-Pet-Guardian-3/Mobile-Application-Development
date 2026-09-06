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

interface LevelInfo {
  nivel: number;
  titulo: string;
  icone: keyof typeof MaterialCommunityIcons.glyphMap;
  proximoNivelXp: number;
  xpBase: number;
}

function calcularNivelPet(pontosTotais: number): LevelInfo {
  if (pontosTotais >= 500) {
    return { nivel: 5, titulo: 'Mestre Lendário', icone: 'crown', proximoNivelXp: 1000, xpBase: 500 };
  }
  if (pontosTotais >= 300) {
    return { nivel: 4, titulo: 'Super Guardião', icone: 'shield-star', proximoNivelXp: 500, xpBase: 300 };
  }
  if (pontosTotais >= 150) {
    return { nivel: 3, titulo: 'Pet Dedicado', icone: 'medal', proximoNivelXp: 300, xpBase: 150 };
  }
  if (pontosTotais >= 50) {
    return { nivel: 2, titulo: 'Aprendiz Ativo', icone: 'star', proximoNivelXp: 150, xpBase: 50 };
  }
  return { nivel: 1, titulo: 'Filhote Iniciante', icone: 'paw', proximoNivelXp: 50, xpBase: 0 };
}

export const PetPointsCard = memo(function PetPointsCard({
  pontos,
  isLoading = false,
  petName = 'Pet',
}: PetPointsCardProps) {
  if (isLoading && !pontos) {
    return (
      <View style={styles.card}>
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

  const levelInfo = calcularNivelPet(pontosTotais);
  const progressoNivel = Math.min(
    100,
    Math.max(
      0,
      Math.round(((pontosTotais - levelInfo.xpBase) / (levelInfo.proximoNivelXp - levelInfo.xpBase)) * 100)
    )
  );

  return (
    <View style={styles.card}>
      {/* Topo: Nível e XP Total */}
      <View style={styles.headerRow}>
        <View style={styles.headerLeft}>
          <View style={styles.levelIconBadge}>
            <MaterialCommunityIcons name={levelInfo.icone} size={22} color={colors.warning[600]} />
          </View>
          <View>
            <Text style={styles.title}>Nível {levelInfo.nivel} • {levelInfo.titulo}</Text>
            <Text style={styles.subtitle}>Conquistas e XP de {petName}</Text>
          </View>
        </View>

        <View style={styles.totalXpBadge}>
          <MaterialCommunityIcons name="star" size={14} color={colors.warning[600]} />
          <Text style={styles.totalXpText}>{pontosTotais} XP</Text>
        </View>
      </View>

      {/* Barra de Progresso até o próximo nível */}
      <View style={styles.progressSection}>
        <View style={styles.progressBarBackground}>
          <View style={[styles.progressBarFill, { width: `${progressoNivel}%` }]} />
        </View>
        <View style={styles.progressLabelsRow}>
          <Text style={styles.progressMetaText}>
            {pontosTotais} / {levelInfo.proximoNivelXp} XP
          </Text>
          <Text style={styles.progressPercentageText}>{progressoNivel}% do nível</Text>
        </View>
      </View>

      {/* Detalhamento dos Pontos (Tarefas + Aulas) */}
      <View style={styles.breakdownRow}>
        {/* Card de Tarefas */}
        <View style={styles.breakdownCard}>
          <View style={styles.breakdownHeader}>
            <View style={[styles.breakdownIconWrapper, { backgroundColor: colors.primary[50] }]}>
              <MaterialCommunityIcons name="clipboard-check-outline" size={18} color={colors.primary[600]} />
            </View>
            <Text style={[styles.breakdownXp, { color: colors.primary[700] }]}>+{pontosTarefas} XP</Text>
          </View>
          <Text style={styles.breakdownTitle}>Tarefas da Rotina</Text>
          <Text style={styles.breakdownDesc}>Cuidados e saúde diária</Text>
        </View>

        {/* Card de Aulas */}
        <View style={styles.breakdownCard}>
          <View style={styles.breakdownHeader}>
            <View style={[styles.breakdownIconWrapper, { backgroundColor: colors.success[50] }]}>
              <MaterialCommunityIcons name="school-outline" size={18} color={colors.success[600]} />
            </View>
            <Text style={[styles.breakdownXp, { color: colors.success[700] }]}>+{pontosAulas} XP</Text>
          </View>
          <Text style={styles.breakdownTitle}>Aulas e Treinos</Text>
          <Text style={styles.breakdownDesc}>Trilhas e adestramento</Text>
        </View>
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
  levelIconBadge: {
    width: 42,
    height: 42,
    borderRadius: 21,
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
  totalXpBadge: {
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
  totalXpText: {
    color: colors.warning[700],
    fontWeight: '900',
    fontSize: 13,
  },
  progressSection: {
    marginBottom: spacing.md,
  },
  progressBarBackground: {
    height: 8,
    backgroundColor: colors.neutral[100],
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: colors.warning[500],
    borderRadius: 4,
  },
  progressLabelsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 4,
  },
  progressMetaText: {
    fontSize: 11,
    color: colors.neutral[500],
    fontWeight: '600',
  },
  progressPercentageText: {
    fontSize: 11,
    color: colors.warning[700],
    fontWeight: '700',
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
  breakdownXp: {
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
