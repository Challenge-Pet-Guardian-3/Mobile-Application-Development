import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { PetResponse } from '../../../types/pet';

export interface PetAvatarCarouselProps {
  pets: PetResponse[];
  selectedPetId?: number;
  onSelectPet: (petId: number) => void;
}

export function PetAvatarCarousel({ pets, selectedPetId, onSelectPet }: PetAvatarCarouselProps) {
  if (pets.length === 0) return null;

  return (
    <View style={styles.carrosselContainer}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.listaDePets}>
        {pets.map((pet) => {
          const isSelected = selectedPetId === pet.id;

          return (
            <TouchableOpacity
              key={pet.id}
              onPress={() => onSelectPet(pet.id)}
              style={styles.itemPetCarrossel}
              activeOpacity={0.8}
            >
              <View style={[styles.miniAvatarBorda, isSelected && styles.miniAvatarSelecionado]}>
                <MaterialCommunityIcons
                  name="paw"
                  size={20}
                  color={isSelected ? '#2563EB' : '#94A3B8'}
                />
              </View>
              <Text
                style={[styles.miniAvatarTexto, isSelected && styles.miniAvatarTextoSelecionado]}
                numberOfLines={1}
              >
                {pet.nome.split(' ')[0]}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  carrosselContainer: {
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  listaDePets: {
    paddingHorizontal: 20,
    gap: 12,
    alignItems: 'center',
  },
  itemPetCarrossel: {
    alignItems: 'center',
    gap: 4,
  },
  miniAvatarBorda: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    backgroundColor: '#F8FAFC',
    alignItems: 'center',
    justifyContent: 'center',
  },
  miniAvatarSelecionado: {
    borderColor: '#2563EB',
    backgroundColor: '#EFF6FF',
    borderWidth: 2,
  },
  miniAvatarTexto: {
    fontSize: 11,
    color: '#64748B',
    fontWeight: '600',
    maxWidth: 55,
  },
  miniAvatarTextoSelecionado: {
    color: '#2563EB',
    fontWeight: '800',
  },
});
