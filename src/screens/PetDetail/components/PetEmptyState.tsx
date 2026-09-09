import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

export function PetEmptyState() {
  return (
    <View style={styles.emptyContainerCenter}>
      <MaterialCommunityIcons name="paw-off" size={48} color="#94A3B8" />
      <Text style={styles.emptyTitle}>Nenhum pet encontrado</Text>
      <Text style={styles.emptySub}>
        Vá até a aba Family Pet para cadastrar o primeiro membro.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  emptyContainerCenter: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#1E293B',
    marginTop: 12,
  },
  emptySub: {
    fontSize: 13,
    color: '#64748B',
    textAlign: 'center',
    marginTop: 4,
  },
});
