import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface AiHeaderProps {
  onGoBack: () => void;
}

export function AiHeader({ onGoBack }: AiHeaderProps) {
  return (
    <View style={styles.headerPad}>
      <TouchableOpacity
        onPress={onGoBack}
        style={styles.btnVoltarTop}
        activeOpacity={0.7}
      >
        <Ionicons name="arrow-back" size={16} color="#1E293B" />
        <Text style={styles.btnVoltarText}>Voltar para o Início</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  headerPad: {
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'ios' ? 50 : 25,
  },
  btnVoltarTop: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: 6,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 8,
  },
  btnVoltarText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1E293B',
  },
});
