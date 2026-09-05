import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
import { shadows } from '../../utils/shadow';
import { LoadingSpinner } from '../LoadingSpinner';
import { TarefaResponse } from '../../types/task';

export interface PetHistoryListProps {
  historico: TarefaResponse[];
  isLoading?: boolean;
}

export function PetHistoryList({ historico, isLoading = false }: PetHistoryListProps) {
  const formatarDataConclusao = (dataStr?: string | null) => {
    if (!dataStr) return 'Concluído';
    try {
      const d = new Date(dataStr);
      return isNaN(d.getTime()) ? 'Concluído' : d.toLocaleDateString('pt-BR');
    } catch {
      return 'Concluído';
    }
  };

  return (
    <View style={styles.historyCard}>
      <View style={styles.historyHeader}>
        <MaterialCommunityIcons name="clipboard-pulse-outline" size={20} color="#2563EB" />
        <Text style={styles.historyTitle}>Histórico de Cuidados & Rotina</Text>
      </View>

      {isLoading ? (
        <LoadingSpinner message="Buscando histórico consolidado..." size="small" />
      ) : historico.length === 0 ? (
        <View style={styles.emptyHistory}>
          <MaterialCommunityIcons name="history" size={28} color="#CBD5E1" />
          <Text style={styles.emptyHistoryText}>Nenhum registro concluído ainda.</Text>
          <Text style={styles.emptyHistorySub}>As rotinas concluídas na Home são sincronizadas aqui!</Text>
        </View>
      ) : (
        historico.map((t) => (
          <View key={t.id} style={styles.historyItem}>
            <View style={styles.historyItemIcon}>
              <Ionicons name="checkmark-circle" size={18} color="#10B981" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.historyItemTitle}>{t.titulo}</Text>
              {t.descricao ? <Text style={styles.historyItemDesc}>{t.descricao}</Text> : null}
              <Text style={styles.historyItemDate}>{formatarDataConclusao(t.conclusao)}</Text>
            </View>
            <View style={styles.historyPoints}>
              <Text style={styles.historyPointsText}>+{t.pontosTarefa} pts</Text>
            </View>
          </View>
        ))
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  historyCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(226, 232, 240, 0.8)',
    ...shadows.sm,
    elevation: 2,
    gap: 12,
  },
  historyHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  historyTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0F172A',
  },
  emptyHistory: {
    alignItems: 'center',
    padding: 20,
    gap: 4,
  },
  emptyHistoryText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#64748B',
  },
  emptyHistorySub: {
    fontSize: 11,
    color: '#94A3B8',
  },
  historyItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
    gap: 10,
  },
  historyItemIcon: {
    width: 26,
    height: 26,
    justifyContent: 'center',
    alignItems: 'center',
  },
  historyItemTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1E293B',
  },
  historyItemDesc: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 1,
  },
  historyItemDate: {
    fontSize: 10,
    color: '#94A3B8',
    marginTop: 1,
  },
  historyPoints: {
    backgroundColor: '#ECFDF5',
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: 8,
  },
  historyPointsText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#059669',
  },
});
