import React from 'react';
import { View, ScrollView, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { colors, spacing, borderRadius } from '../../../constants/theme';
import { shadows } from '../../../utils/shadow';
import { useHomeData } from '../../../hooks/useHomeData';

interface HomePetSelectorProps {
  pets: ReturnType<typeof useHomeData>['pets'];
}

export function HomePetSelector({ pets }: HomePetSelectorProps) {
  const { list, active, select } = pets;

  if ((list?.length ?? 0) === 0) return null;

  return (
    <View style={styles.petSelectorContainer}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.petsScroll}>
        {list?.map((pet) => {
          const isSelected = active?.id === pet?.id;
          return (
            <TouchableOpacity
              key={pet?.id}
              style={[styles.petPill, isSelected && styles.petPillSelected]}
              onPress={() => pet?.id && select(pet.id)}
              activeOpacity={0.8}
            >
              <View style={[styles.petAvatarWrapper, isSelected && styles.petAvatarWrapperSelected]}>
                <MaterialCommunityIcons name="paw" size={18} color={isSelected ? '#FFFFFF' : '#64748B'} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.petPillName, isSelected && styles.petPillNameSelected]} numberOfLines={1}>
                  {pet?.nome}
                </Text>
                <Text style={[styles.petPillBreed, isSelected && styles.petPillBreedSelected]} numberOfLines={1}>
                  {pet?.raca}
                </Text>
              </View>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  petSelectorContainer: {
    marginBottom: 4,
  },
  petsScroll: {
    gap: 10,
    paddingVertical: 2,
  },
  petPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.neutral.white,
    paddingVertical: spacing.xs,
    paddingHorizontal: 12,
    borderRadius: borderRadius.xl,
    borderWidth: 1,
    borderColor: 'rgba(226, 232, 240, 0.8)',
    gap: 10,
    ...shadows.sm,
  },
  petPillSelected: {
    backgroundColor: colors.neutral[900],
    borderColor: colors.neutral[900],
  },
  petAvatarWrapper: {
    width: 32,
    height: 32,
    borderRadius: borderRadius.md,
    backgroundColor: colors.neutral[100],
    justifyContent: 'center',
    alignItems: 'center',
  },
  petAvatarWrapperSelected: {
    backgroundColor: colors.primary[600],
  },
  petPillName: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.neutral[900],
  },
  petPillNameSelected: {
    color: colors.neutral.white,
  },
  petPillBreed: {
    fontSize: 11,
    color: colors.neutral[500],
    fontWeight: '500',
  },
  petPillBreedSelected: {
    color: colors.neutral[400],
  },
});
