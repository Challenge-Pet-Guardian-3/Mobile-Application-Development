import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { PetResponse } from '../../types/pet';
import { getAvatarById } from '../../constants/Avatares';

interface PetCardProps {
  pet: PetResponse;
  onPress?: () => void;
}

export function PetCard({ pet, onPress }: PetCardProps) {
  const avatar = getAvatarById(pet.avatarId);

  return (
    <TouchableOpacity
      style={styles.card}
      onPress={onPress}
      activeOpacity={0.85}
      disabled={!onPress}
    >
      <View style={styles.avatarWrapper}>
        {avatar ? (
          <Image source={avatar} style={styles.avatarImg} />
        ) : (
          <MaterialCommunityIcons name="paw" size={24} color="#2563EB" />
        )}
      </View>

      <Text style={styles.name} numberOfLines={1}>
        {pet.nome}
      </Text>

      <Text style={styles.breed} numberOfLines={1}>
        {pet.raca || 'Pet'}
      </Text>

      <View style={styles.badge}>
        <Text style={styles.badgeText}>Porte {pet.porte}</Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    width: '48%',
    backgroundColor: '#F8FAFC',
    padding: 14,
    borderRadius: 18,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  avatarWrapper: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: '#EFF6FF',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
    marginBottom: 8,
  },
  avatarImg: {
    width: '100%',
    height: '100%',
  },
  name: {
    fontSize: 14,
    fontWeight: '800',
    color: '#1E293B',
  },
  breed: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 2,
    marginBottom: 8,
  },
  badge: {
    backgroundColor: '#E2E8F0',
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: 8,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#475569',
  },
});
