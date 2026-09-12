import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface AiHeaderProps {
  onGoBack: () => void;
  onClearChat?: () => void;
  onOpenHistory?: () => void;
  hasMessages?: boolean;
}

export function AiHeader({ onGoBack, onClearChat, onOpenHistory, hasMessages }: AiHeaderProps) {
  return (
    <View style={styles.headerPad}>
      <View style={styles.headerRow}>
        <TouchableOpacity
          onPress={onGoBack}
          style={styles.btnVoltarTop}
          activeOpacity={0.7}
        >
          <Ionicons name="arrow-back" size={16} color="#1E293B" />
          <Text style={styles.btnVoltarText}>Voltar para Início</Text>
        </TouchableOpacity>

        <View style={styles.rightActions}>
          {onOpenHistory && (
            <TouchableOpacity
              onPress={onOpenHistory}
              style={styles.btnHistorico}
              activeOpacity={0.7}
            >
              <Ionicons name="time-outline" size={14} color="#475569" />
              <Text style={styles.btnHistoricoText}>Histórico</Text>
            </TouchableOpacity>
          )}

          {hasMessages && onClearChat && (
            <TouchableOpacity
              onPress={onClearChat}
              style={styles.btnNovaDuvida}
              activeOpacity={0.7}
            >
              <Ionicons name="sparkles-outline" size={14} color="#2563EB" />
              <Text style={styles.btnNovaDuvidaText}>Nova Dúvida</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  headerPad: {
    paddingHorizontal: 16,
    paddingTop: Platform.OS === 'ios' ? 50 : 25,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  btnVoltarTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  btnVoltarText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#1E293B',
  },
  rightActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  btnHistorico: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 6,
    paddingHorizontal: 9,
    borderRadius: 12,
    backgroundColor: '#F1F5F9',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  btnHistoricoText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#475569',
  },
  btnNovaDuvida: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 6,
    paddingHorizontal: 9,
    borderRadius: 12,
    backgroundColor: '#EFF6FF',
    borderWidth: 1,
    borderColor: '#BFDBFE',
  },
  btnNovaDuvidaText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#2563EB',
  },
});
