import React, { useMemo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { shadows } from '../../../utils/shadow';
import { DiaOfensiva } from '../../../types/models';
import { TarefaResponse } from '../../../types/task';
import { calcularDiasSemanaAtual, calcularTotalOfensiva } from '../../../utils/streakUtils';

interface StreakCardProps {
  streakDays?: DiaOfensiva[];
  totalStreak?: number;
  tasks?: TarefaResponse[];
}

function getDiasDaSemanaVazios(): DiaOfensiva[] {
  const labels = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'];
  const hoje = new Date();
  const diaSemanaIndex = (hoje.getDay() + 6) % 7;

  const segunda = new Date(hoje);
  segunda.setDate(hoje.getDate() - diaSemanaIndex);

  return labels.map((label, idx) => {
    const dataDia = new Date(segunda);
    dataDia.setDate(segunda.getDate() + idx);
    const dayNumber = String(dataDia.getDate());
    const isToday = idx === diaSemanaIndex;

    return {
      id: `dia_${idx}_${dayNumber}`,
      dayLabel: label,
      dayNumber,
      done: false,
      isToday,
      missed: false,
    };
  });
}

export function HomeStreakCard({ streakDays, totalStreak, tasks }: StreakCardProps) {
  const { diasExibidos, streakExibido } = useMemo(() => {
    if (tasks) {
      return {
        diasExibidos: calcularDiasSemanaAtual(tasks),
        streakExibido: totalStreak !== undefined ? totalStreak : calcularTotalOfensiva(tasks),
      };
    }

    return {
      diasExibidos: streakDays && streakDays.length > 0 ? streakDays : getDiasDaSemanaVazios(),
      streakExibido: totalStreak ?? 0,
    };
  }, [tasks, streakDays, totalStreak]);

  return (
    <View style={styles.streakCard}>
      <View style={styles.streakHeader}>
        <View style={styles.titleRow}>
          <Text style={styles.sectionTitle}>Ofensiva Familiar</Text>
          <Text style={styles.sectionSubtitle}>Cuidado diário consistente</Text>
        </View>

        <View style={styles.totalStreakBadge}>
          <MaterialCommunityIcons name="fire" size={18} color="#EA580C" />
          <Text style={styles.totalStreakText}>
            {streakExibido} {streakExibido === 1 ? 'dia' : 'dias'}
          </Text>
        </View>
      </View>

      <View style={styles.streakRow}>
        {diasExibidos.map((item) => (
          <View key={item.id} style={styles.streakColumn}>
            <View
              style={[
                styles.streakDayCircle,
                item.done && styles.streakCompleted,
                item.isToday && !item.done && styles.streakToday,
                item.missed && styles.streakMissed,
              ]}
            >
              {item.done ? (
                <MaterialCommunityIcons name="check" size={16} color="#FFFFFF" />
              ) : item.isToday ? (
                <MaterialCommunityIcons name="paw" size={14} color="#2563EB" />
              ) : item.missed ? (
                <MaterialCommunityIcons name="close" size={15} color="#EF4444" />
              ) : (
                <Text style={styles.streakDayNumber}>{item.dayNumber}</Text>
              )}
            </View>
            <Text
              style={[
                styles.streakDayLabel,
                item.isToday && styles.streakDayLabelToday,
                item.missed && styles.streakDayLabelMissed,
              ]}
            >
              {item.dayLabel}
            </Text>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  streakCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(226, 232, 240, 0.8)',
    ...shadows.sm,
    elevation: 2,
  },
  streakHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  titleRow: {
    gap: 2,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0F172A',
  },
  sectionSubtitle: {
    fontSize: 12,
    color: '#64748B',
  },
  totalStreakBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF7ED',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#FFEDD5',
    gap: 4,
  },
  totalStreakText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#C2410C',
  },
  streakRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  streakColumn: {
    alignItems: 'center',
    gap: 6,
  },
  streakDayCircle: {
    width: 38,
    height: 48,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  streakCompleted: {
    backgroundColor: '#10B981',
    borderColor: '#10B981',
  },
  streakToday: {
    backgroundColor: '#EFF6FF',
    borderColor: '#93C5FD',
    borderWidth: 1.5,
  },
  streakMissed: {
    backgroundColor: '#FEF2F2',
    borderColor: '#FECACA',
    borderWidth: 1.5,
  },
  streakDayNumber: {
    color: '#94A3B8',
    fontSize: 12,
    fontWeight: '700',
  },
  streakDayLabel: {
    fontSize: 11,
    color: '#64748B',
    fontWeight: '600',
  },
  streakDayLabelToday: {
    color: '#2563EB',
    fontWeight: '800',
  },
  streakDayLabelMissed: {
    color: '#EF4444',
    fontWeight: '700',
  },
});
