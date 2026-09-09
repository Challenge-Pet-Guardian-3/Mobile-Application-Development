import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useAiAssistantScreen } from '../../../hooks/useAiAssistantScreen';

interface AiPetContextSelectorProps {
  pet: ReturnType<typeof useAiAssistantScreen>['pet'];
}

export function AiPetContextSelector({ pet }: AiPetContextSelectorProps) {
  if ((pet?.pets?.length ?? 0) === 0) return null;

  return (
    <View style={styles.petContextBar}>
      <Text style={styles.petContextLabel}>Contexto:</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
        {pet?.pets?.map((p) => {
          const isSelected = pet?.activePet?.id === p.id;
          return (
            <TouchableOpacity
              key={p.id}
              style={[
                styles.petContextChip,
                isSelected && styles.petContextChipSelected,
              ]}
              onPress={() => pet.setSelectedPetId(p.id)}
              activeOpacity={0.8}
            >
              <Text
                style={[
                  styles.petContextChipText,
                  isSelected && styles.petContextChipTextSelected,
                ]}
              >
                🐾 {p?.nome}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  petContextBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  petContextLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#64748B',
  },
  petContextChip: {
    backgroundColor: '#FFFFFF',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(226, 232, 240, 0.8)',
  },
  petContextChipSelected: {
    backgroundColor: '#0F172A',
    borderColor: '#0F172A',
  },
  petContextChipText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#475569',
  },
  petContextChipTextSelected: {
    color: '#FFFFFF',
  },
});
