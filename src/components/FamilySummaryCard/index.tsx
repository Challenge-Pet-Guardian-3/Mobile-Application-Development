import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { shadows } from '../../utils/shadow';

export interface FamilySummaryCardProps {
  tutorNome?: string;
  petsCount: number;
  tarefasPendentes: number;
  tarefasConcluidas: number;
  pontosAcumulados: number;
}

export function FamilySummaryCard({
  tutorNome,
  petsCount,
  tarefasPendentes,
  tarefasConcluidas,
  pontosAcumulados,
}: FamilySummaryCardProps) {
  const primeiroNome = tutorNome?.split(' ')[0] || 'Tutor';

  return (
    <View style={styles.summaryCard}>
      <View style={styles.summaryTop}>
        <View style={{ flex: 1, paddingRight: 8 }}>
          <Text style={styles.summaryTitle}>Família de {primeiroNome}</Text>
          <Text style={styles.summarySub}>
            {petsCount} {petsCount === 1 ? 'pet' : 'pets'} • {tarefasPendentes} pendentes • {tarefasConcluidas} concluídas
          </Text>
        </View>
        <View style={styles.xpCircle}>
          <Text style={styles.xpCircleVal}>{pontosAcumulados}</Text>
          <Text style={styles.xpCircleLabel}>XP Rede</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  summaryCard: {
    backgroundColor: '#0F172A',
    borderRadius: 24,
    padding: 22,
    ...shadows.lg,
    elevation: 3,
  },
  summaryTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: '#FFFFFF',
  },
  summarySub: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.7)',
    marginTop: 4,
  },
  xpCircle: {
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 16,
    alignItems: 'center',
  },
  xpCircleVal: {
    fontSize: 17,
    fontWeight: '900',
    color: '#FFFFFF',
  },
  xpCircleLabel: {
    fontSize: 10,
    color: 'rgba(255, 255, 255, 0.8)',
    fontWeight: '700',
  },
});
