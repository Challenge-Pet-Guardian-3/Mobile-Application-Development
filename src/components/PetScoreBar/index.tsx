import React, { memo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { shadows } from '../../utils/shadow';
import { colors, spacing, borderRadius } from '../../constants/theme';

interface PetScoreBarProps {
  score: number;
  petName?: string;
  tarefasConcluidas?: number;
  totalTarefas?: number;
}

export const PetScoreBar = memo(function PetScoreBar({
  score,
  petName = 'Pet',
  tarefasConcluidas = 0,
  totalTarefas = 0,
}: PetScoreBarProps) {
  // Porcentagem de tarefas da rotina diária concluídas
  const percentage =
    totalTarefas > 0 ? Math.round((tarefasConcluidas / totalTarefas) * 100) : 100;

  // Status de bem-estar baseado na rotina diária
  let statusTexto = 'Tarefas Pendentes 📋';
  let statusCor: string = colors.danger[500];
  let statusBg: string = colors.danger[50];

  if (percentage === 100) {
    statusTexto = 'Tudo em Dia ✨';
    statusCor = colors.success.default;
    statusBg = colors.success[50];
  } else if (percentage >= 50) {
    statusTexto = 'Em Andamento 👍';
    statusCor = colors.warning[500];
    statusBg = colors.warning[50];
  }

  return (
    <View style={styles.card}>
      <View style={styles.headerRow}>
        <View style={styles.infoLeft}>
          <View style={styles.iconCircle}>
            <MaterialCommunityIcons name="heart-pulse" size={22} color={colors.primary[600]} />
          </View>
          <View>
            <Text style={styles.petTitle}>Bem-estar de {petName}</Text>
            <View style={[styles.statusPill, { backgroundColor: statusBg }]}>
              <Text style={[styles.statusText, { color: statusCor }]}>{statusTexto}</Text>
            </View>
          </View>
        </View>

        <View style={styles.pointsBadge}>
          <MaterialCommunityIcons name="star" size={14} color={colors.warning[600]} />
          <Text style={styles.pointsBadgeText}>{score} XP</Text>
        </View>
      </View>

      <View style={styles.progressContainer}>
        <View style={styles.progressBarBackground}>
          <View style={[styles.progressBarFill, { width: `${percentage}%` }]} />
        </View>
      </View>

      <View style={styles.footerRow}>
        <Text style={styles.pointsLabel}>
          Rotina Diária: {tarefasConcluidas}/{totalTarefas} {totalTarefas === 1 ? 'tarefa' : 'tarefas'}
        </Text>
        <Text style={styles.pointsValue}>
          <Text style={styles.currentPoints}>{score}</Text> XP Acumulados
        </Text>
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
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  infoLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  iconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.primary[50],
    justifyContent: 'center',
    alignItems: 'center',
  },
  petTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.neutral[900],
  },
  statusPill: {
    alignSelf: 'flex-start',
    paddingVertical: 2,
    paddingHorizontal: spacing.xs,
    borderRadius: borderRadius.sm,
    marginTop: 4,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '700',
  },
  pointsBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: colors.warning[50],
    paddingVertical: spacing.xs,
    paddingHorizontal: 10,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.warning[200],
  },
  pointsBadgeText: {
    color: colors.warning[600],
    fontWeight: '900',
    fontSize: 13,
  },
  progressContainer: {
    marginBottom: 10,
  },
  progressBarBackground: {
    height: 10,
    backgroundColor: colors.neutral[100],
    borderRadius: 5,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: colors.primary[600],
    borderRadius: 5,
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  pointsLabel: {
    fontSize: 12,
    color: colors.neutral[500],
    fontWeight: '600',
  },
  pointsValue: {
    fontSize: 13,
    color: colors.neutral[500],
    fontWeight: '600',
  },
  currentPoints: {
    color: colors.primary[600],
    fontWeight: '800',
    fontSize: 15,
  },
});
