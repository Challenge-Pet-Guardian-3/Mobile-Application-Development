import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Header } from '../../../components/Header';

interface PetDetailHeaderProps {
  onGoBack: () => void;
  subtitle?: string;
}

export function PetDetailHeader({
  onGoBack,
  subtitle = 'Ficha Completa & Histórico de Cuidados',
}: PetDetailHeaderProps) {
  return (
    <View style={styles.paddingHeader}>
      <TouchableOpacity onPress={onGoBack} style={styles.btnVoltarTop} activeOpacity={0.7}>
        <Ionicons name="arrow-back" size={18} color="#1E293B" />
        <Text style={styles.btnVoltarText}>Voltar</Text>
      </TouchableOpacity>
      <Header subtitle={subtitle} />
    </View>
  );
}

const styles = StyleSheet.create({
  paddingHeader: {
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
