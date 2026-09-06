import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { PetPontuacaoResponse } from '../../types/pet';
import { shadows } from '../../utils/shadow';
import { LoadingSpinner } from '../LoadingSpinner';

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
          <MaterialCommunityIcons name="star-circle-outline" size={20} color="#2563EB" />
          <Text style={styles.pointsTitle}>Pontuação do Pet</Text>
        </View>

        <View style={styles.totalBadge}>
          <MaterialCommunityIcons name="star" size={14} color="#D97706" />
          <Text style={styles.totalBadgeText}>{pontosTotais} XP</Text>
        </View>
      </View>

      <View style={styles.statsRow}>
        <View style={styles.statBox}>
          <View style={[styles.iconBox, { backgroundColor: '#EFF6FF' }]}>
            <MaterialCommunityIcons name="clipboard-check-outline" size={18} color="#2563EB" />
          </View>
          <Text style={styles.statValue}>+{pontosTarefas} pts</Text>
          <Text style={styles.statLabel}>Tarefas da Rotina</Text>
        </View>

        <View style={styles.statBox}>
          <View style={[styles.iconBox, { backgroundColor: '#ECFDF5' }]}>
            <MaterialCommunityIcons name="school-outline" size={18} color="#10B981" />
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
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(226, 232, 240, 0.8)',
    ...shadows.sm,
    elevation: 2,
    gap: 14,
  },
  pointsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  pointsTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0F172A',
  },
  totalBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFBEB',
    paddingVertical: 5,
    paddingHorizontal: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#FEF3C7',
    gap: 4,
  },
  totalBadgeText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#D97706',
  },
  statsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  statBox: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    borderRadius: 16,
    paddingVertical: 14,
    paddingHorizontal: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  iconBox: {
    width: 36,
    height: 36,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  statValue: {
    fontSize: 16,
    fontWeight: '900',
    color: '#0F172A',
  },
  statLabel: {
    fontSize: 11,
    color: '#64748B',
    fontWeight: '600',
    marginTop: 2,
  },
});
