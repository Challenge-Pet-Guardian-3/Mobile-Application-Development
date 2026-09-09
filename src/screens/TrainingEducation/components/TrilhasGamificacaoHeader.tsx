import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTrainings } from '../../../hooks/useTrainings';

interface TrilhasGamificacaoHeaderProps {
  trail: ReturnType<typeof useTrainings>['trail'];
  pet: ReturnType<typeof useTrainings>['pet'];
}

export function TrilhasGamificacaoHeader({ trail, pet }: TrilhasGamificacaoHeaderProps) {
  const licoesConcluidas = trail?.licoesConcluidas ?? 0;
  const totalXp = pet?.totalXpGanho ?? 0;

  return (
    <View style={styles.duoTopBar}>
      <View style={styles.duoStatItem}>
        <MaterialCommunityIcons name="fire" size={24} color="#FF9600" />
        <Text style={styles.duoStatVal}>
          {licoesConcluidas} {licoesConcluidas === 1 ? 'Lição' : 'Lições'}
        </Text>
      </View>

      <View style={styles.duoStatItem}>
        <MaterialCommunityIcons name="diamond" size={22} color="#1CB0F6" />
        <Text style={[styles.duoStatVal, { color: '#0284C7' }]}>{totalXp} XP</Text>
      </View>

      <View style={styles.duoStatItem}>
        <MaterialCommunityIcons name="trophy-outline" size={22} color="#FFC800" />
        <Text style={[styles.duoStatVal, { color: '#B45309' }]}>Trilha Ativa</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  duoTopBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#FFF',
    marginHorizontal: 20,
    marginTop: 10,
    marginBottom: 16,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    elevation: 2,
  },
  duoStatItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  duoStatVal: {
    fontSize: 14,
    fontWeight: '900',
    color: '#1E293B',
  },
});
