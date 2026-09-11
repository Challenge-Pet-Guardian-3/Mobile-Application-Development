import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface AiHeaderProps {
  onGoBack: () => void;
  onClearChat?: () => void;
  hasMessages?: boolean;
}

export function AiHeader({ onGoBack, onClearChat, hasMessages }: AiHeaderProps) {
  return (
    <View style={styles.headerPad}>
      <View style={styles.headerRow}>
        <TouchableOpacity
          onPress={onGoBack}
          style={styles.btnVoltarTop}
          activeOpacity={0.7}
        >
          <Ionicons name="arrow-back" size={16} color="#1E293B" />
          <Text style={styles.btnVoltarText}>Voltar para o Início</Text>
        </TouchableOpacity>

        {hasMessages && onClearChat && (
          <TouchableOpacity
            onPress={onClearChat}
            style={styles.btnNovaDuvida}
            activeOpacity={0.7}
          >
            <Ionicons name="sparkles-outline" size={15} color="#2563EB" />
            <Text style={styles.btnNovaDuvidaText}>Nova Dúvida</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  headerPad: {
    paddingHorizontal: 20,
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
    gap: 6,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  btnVoltarText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1E293B',
  },
  btnNovaDuvida: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 12,
    backgroundColor: '#EFF6FF',
    borderWidth: 1,
    borderColor: '#BFDBFE',
  },
  btnNovaDuvidaText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#2563EB',
  },
});
