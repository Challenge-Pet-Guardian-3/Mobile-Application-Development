import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTrainings } from '../../../hooks/useTrainings';

interface SeletorPetTreinamentoProps {
  pet: ReturnType<typeof useTrainings>['pet'];
}

export function SeletorPetTreinamento({ pet }: SeletorPetTreinamentoProps) {
  const { pets, petAtivo, setSelectedPetIndex } = pet;

  if ((pets?.length ?? 0) === 0) return null;

  return (
    <View style={styles.petSelectorBox}>
      <Text style={styles.petSelectorLabel}>Pet em Treinamento:</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.petSelectorScroll}>
        {pets.map((p, idx) => {
          const isSelected = p.id === petAtivo?.id;
          return (
            <TouchableOpacity
              key={p.id}
              style={[styles.petChip, isSelected && styles.petChipActive]}
              onPress={() => setSelectedPetIndex(idx)}
              activeOpacity={0.8}
            >
              <Ionicons
                name="paw"
                size={15}
                color={isSelected ? '#FFFFFF' : '#64748B'}
              />
              <Text style={[styles.petChipText, isSelected && styles.petChipTextActive]}>
                {p?.nome}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  petSelectorBox: {
    marginHorizontal: 20,
    marginBottom: 16,
  },
  petSelectorLabel: {
    fontSize: 12,
    fontWeight: '800',
    color: '#64748B',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  petSelectorScroll: {
    gap: 8,
  },
  petChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#FFF',
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
  },
  petChipActive: {
    backgroundColor: '#2563EB',
    borderColor: '#2563EB',
  },
  petChipText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#475569',
  },
  petChipTextActive: {
    color: '#FFF',
    fontWeight: '900',
  },
});
