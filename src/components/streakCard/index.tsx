import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { DiaOfensiva } from '../../types/models';

interface StreakCardProps {
  streakDays?: DiaOfensiva[];
  totalStreak?: number;
}

const DIAS_PADRAO = [
  { id: '1', dayLabel: 'Seg', dayNumber: '24', done: true },
  { id: '2', dayLabel: 'Ter', dayNumber: '25', done: true },
  { id: '3', dayLabel: 'Qua', dayNumber: '26', done: true },
  { id: '4', dayLabel: 'Qui', dayNumber: '27', done: false, isToday: true },
  { id: '5', dayLabel: 'Sex', dayNumber: '28', done: false },
  { id: '6', dayLabel: 'Sáb', dayNumber: '29', done: false },
  { id: '7', dayLabel: 'Dom', dayNumber: '30', done: false },
];

export function StreakCard({ totalStreak = 3 }: StreakCardProps) {
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
            {totalStreak} {totalStreak === 1 ? 'dia' : 'dias'}
          </Text>
        </View>
      </View>

      <View style={styles.streakRow}>
        {DIAS_PADRAO.map((item) => (
          <View key={item.id} style={styles.streakColumn}>
            <View
              style={[
                styles.streakDayCircle,
                item.done && styles.streakCompleted,
                item.isToday && !item.done && styles.streakToday,
              ]}
            >
              {item.done ? (
                <MaterialCommunityIcons name="check" size={16} color="#FFFFFF" />
              ) : item.isToday ? (
                <MaterialCommunityIcons name="paw" size={14} color="#2563EB" />
              ) : (
                <Text style={styles.streakDayNumber}>{item.dayNumber}</Text>
              )}
            </View>
            <Text style={[styles.streakDayLabel, item.isToday && styles.streakDayLabelToday]}>
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
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.03,
    shadowRadius: 10,
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
});