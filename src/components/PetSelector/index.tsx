import React, { memo } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ViewStyle } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

export interface PetOption {
  id: number;
  nome: string;
}

export interface PetSelectorProps {
  label?: string;
  pets: PetOption[];
  selectedPetId: number | null;
  onSelectPet: (petId: number) => void;
  containerStyle?: ViewStyle;
}

export const PetSelector = memo(function PetSelector({
  label = 'Para qual Pet?',
  pets,
  selectedPetId,
  onSelectPet,
  containerStyle,
}: PetSelectorProps) {
  if (pets.length === 0) return null;

  return (
    <View style={[styles.container, containerStyle]}>
      {label ? <Text style={styles.label}>{label}</Text> : null}
      <View style={styles.chipsContainer}>
        {pets.map((pet) => {
          const isSelected = selectedPetId === pet.id;
          return (
            <TouchableOpacity
              key={pet.id}
              style={[styles.chip, isSelected && styles.chipSelected]}
              onPress={() => onSelectPet(pet.id)}
              activeOpacity={0.75}
            >
              <MaterialCommunityIcons
                name="paw"
                size={14}
                color={isSelected ? '#FFFFFF' : '#64748B'}
                style={{ marginRight: 6 }}
              />
              <Text style={[styles.chipText, isSelected && styles.chipTextSelected]}>
                {pet.nome}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  label: {
    fontSize: 13,
    fontWeight: '700',
    color: '#334155',
    marginBottom: 8,
    marginTop: 4,
  },
  chipsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 10,
    backgroundColor: '#F1F5F9',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  chipSelected: {
    backgroundColor: '#0284C7',
    borderColor: '#0284C7',
  },
  chipText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#64748B',
  },
  chipTextSelected: {
    color: '#FFFFFF',
  },
});
