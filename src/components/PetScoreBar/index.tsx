import React, { memo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { shadows } from '../../utils/shadow';

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
  let statusCor = '#EF4444';
  let statusBg = '#FEF2F2';

  if (percentage === 100) {
    statusTexto = 'Tudo em Dia ✨';
    statusCor = '#10B981';
    statusBg = '#ECFDF5';
  } else if (percentage >= 50) {
    statusTexto = 'Em Andamento 👍';
    statusCor = '#F59E0B';
    statusBg = '#FFFBEB';
  }

  return (
    <View style={styles.card}>
      <View style={styles.headerRow}>
        <View style={styles.infoLeft}>
          <View style={styles.iconCircle}>
            <MaterialCommunityIcons name="heart-pulse" size={22} color="#2563EB" />
          </View>
          <View>
            <Text style={styles.petTitle}>Bem-estar de {petName}</Text>
            <View style={[styles.statusPill, { backgroundColor: statusBg }]}>
              <Text style={[styles.statusText, { color: statusCor }]}>{statusTexto}</Text>
            </View>
          </View>
        </View>

        <View style={styles.pointsBadge}>
          <MaterialCommunityIcons name="star" size={14} color="#D97706" />
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
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(226, 232, 240, 0.8)',
    ...shadows.sm,
    elevation: 2,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
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
    backgroundColor: '#EFF6FF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  petTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0F172A',
  },
  statusPill: {
    alignSelf: 'flex-start',
    paddingVertical: 2,
    paddingHorizontal: 8,
    borderRadius: 8,
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
    backgroundColor: '#FFFBEB',
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#FDE68A',
  },
  pointsBadgeText: {
    color: '#D97706',
    fontWeight: '900',
    fontSize: 13,
  },
  progressContainer: {
    marginBottom: 10,
  },
  progressBarBackground: {
    height: 10,
    backgroundColor: '#F1F5F9',
    borderRadius: 5,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#2563EB',
    borderRadius: 5,
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  pointsLabel: {
    fontSize: 12,
    color: '#64748B',
    fontWeight: '600',
  },
  pointsValue: {
    fontSize: 13,
    color: '#64748B',
    fontWeight: '600',
  },
  currentPoints: {
    color: '#2563EB',
    fontWeight: '800',
    fontSize: 15,
  },
});
