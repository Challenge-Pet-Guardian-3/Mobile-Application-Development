import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useHomeData } from '../../../hooks/useHomeData';
import { shadows } from '../../../utils/shadow';
import { colors, spacing, borderRadius } from '../../../constants/theme';

interface HomeScoreBarProps {
  pets: ReturnType<typeof useHomeData>['pets'];
  routine: ReturnType<typeof useHomeData>['routine'];
  onPress: () => void;
}

export function HomeScoreBar({ pets, routine, onPress }: HomeScoreBarProps) {
  const activePet = pets?.active;
  if (!activePet) return null;

  const score = routine?.score ?? 0;
  const petName = activePet?.nome ?? 'Pet';
  const tarefasConcluidas = routine?.completedToday?.length ?? 0;
  const tarefasExpiradas = routine?.expiredToday?.length ?? 0;
  const totalTarefas = routine?.todayTasks?.length ?? 0;

  const hasTasks = totalTarefas > 0;
  const percentage = hasTasks ? Math.round((tarefasConcluidas / totalTarefas) * 100) : 0;

  let statusTexto = 'Sem Tarefas Hoje 🐾';
  let statusCor: string = colors.neutral[600];
  let statusBg: string = colors.neutral[100];
  let progressColor: string = colors.neutral[300];

  if (!hasTasks) {
    statusTexto = 'Sem Tarefas Hoje 🐾';
    statusCor = colors.neutral[600];
    statusBg = colors.neutral[100];
    progressColor = colors.neutral[300];
  } else if (tarefasConcluidas === totalTarefas) {
    statusTexto = 'Tudo em Dia ✨';
    statusCor = colors.success.default;
    statusBg = colors.success[50];
    progressColor = colors.success.default;
  } else if (tarefasExpiradas > 0) {
    statusTexto = tarefasExpiradas === 1 ? '1 Tarefa Expirada ⚠️' : `${tarefasExpiradas} Tarefas Expiradas ⚠️`;
    statusCor = colors.danger[600];
    statusBg = colors.danger[50];
    progressColor = percentage > 0 ? colors.warning[500] : colors.danger[500];
  } else if (percentage >= 50) {
    statusTexto = 'Em Andamento 👍';
    statusCor = colors.warning[600];
    statusBg = colors.warning[50];
    progressColor = colors.warning[500];
  } else {
    statusTexto = 'Tarefas Pendentes 📋';
    statusCor = colors.primary[600];
    statusBg = colors.primary[50];
    progressColor = colors.primary[600];
  }

  return (
    <TouchableOpacity activeOpacity={0.9} onPress={onPress}>
      <View style={styles.card}>
        <View style={styles.headerRow}>
          <View style={styles.infoLeft}>
            <View style={styles.iconCircle}>
              <MaterialCommunityIcons name="heart-pulse" size={22} color={colors.primary[600]} />
            </View>
            <View style={styles.titleWrapper}>
              <Text style={styles.petTitle} numberOfLines={1} ellipsizeMode="tail">
                Bem-estar de {petName}
              </Text>
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
            <View style={[styles.progressBarFill, { width: `${percentage}%`, backgroundColor: progressColor }]} />
          </View>
        </View>

        <View style={styles.footerRow}>
          <Text style={styles.pointsLabel}>
            Rotina Diária: {tarefasConcluidas}/{totalTarefas} {totalTarefas === 1 ? 'tarefa' : 'tarefas'}
            {tarefasExpiradas > 0 ? ` • ${tarefasExpiradas} expirada${tarefasExpiradas > 1 ? 's' : ''}` : ''}
          </Text>
          <Text style={styles.pointsValue}>
            <Text style={styles.currentPoints}>{score}</Text> XP Acumulados
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

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
    marginRight: spacing.sm,
  },
  titleWrapper: {
    flex: 1,
  },
  iconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.primary[50],
    justifyContent: 'center',
    alignItems: 'center',
    flexShrink: 0,
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
    flexShrink: 0,
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
