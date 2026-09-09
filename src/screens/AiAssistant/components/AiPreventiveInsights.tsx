import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LoadingSpinner } from '../../../components/LoadingSpinner';
import { shadows } from '../../../utils/shadow';
import { useAiAssistantScreen } from '../../../hooks/useAiAssistantScreen';

interface AiPreventiveInsightsProps {
  insights: ReturnType<typeof useAiAssistantScreen>['insights'];
}

export function AiPreventiveInsights({ insights }: AiPreventiveInsightsProps) {
  const hasInsights = (insights?.data?.length ?? 0) > 0;
  if (!insights?.isLoading && !hasInsights) return null;

  return (
    <View style={styles.insightsSection}>
      <View style={styles.insightsHeader}>
        <MaterialCommunityIcons name="lightbulb-on-outline" size={18} color="#2563EB" />
        <Text style={styles.insightsTitle}>Recomendações Preventivas</Text>
      </View>

      {insights?.isLoading ? (
        <LoadingSpinner message="Analisando histórico..." size="small" />
      ) : (
        insights?.data?.map((ins, idx) => (
          <View key={idx} style={styles.insightCard}>
            <Text style={styles.insightCardTitle}>{ins?.titulo}</Text>
            <Text style={styles.insightCardDesc}>{ins?.descricao}</Text>
          </View>
        ))
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  insightsSection: {
    backgroundColor: '#FFFFFF',
    borderRadius: 22,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(226, 232, 240, 0.8)',
    gap: 10,
    ...shadows.xs,
    elevation: 1,
  },
  insightsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 2,
  },
  insightsTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0F172A',
  },
  insightCard: {
    backgroundColor: '#F8FAFC',
    borderRadius: 14,
    padding: 12,
    borderWidth: 1,
    borderColor: '#EDF2F7',
  },
  insightCardTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#2563EB',
    marginBottom: 2,
  },
  insightCardDesc: {
    fontSize: 12,
    color: '#475569',
    lineHeight: 18,
  },
});
