import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { PetResponse } from '../../types/pet';
import { getAvatarById } from '../../constants/Avatares';

interface PetCardProps {
  pet: PetResponse;
  isResponsavelPrincipal?: boolean;
  tarefasCount?: number;
  onPress?: () => void;
}

export function PetCard({ pet, isResponsavelPrincipal, tarefasCount, onPress }: PetCardProps) {
  const avatar = getAvatarById(pet.avatarId);

  return (
    <TouchableOpacity
      style={styles.card}
      onPress={onPress}
      activeOpacity={0.85}
      disabled={!onPress}
    >
      {isResponsavelPrincipal && (
        <View style={styles.principalBadge}>
          <Ionicons name="shield-checkmark" size={10} color="#FFFFFF" />
          <Text style={styles.principalBadgeText}>Tutor Princ.</Text>
        </View>
      )}

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

      <View style={styles.badgesRow}>
        <View style={styles.badge}>
          <Text style={styles.badgeText}>Porte {pet.porte}</Text>
        </View>
        {tarefasCount !== undefined && tarefasCount > 0 ? (
          <View style={[styles.badge, { backgroundColor: '#EFF6FF' }]}>
            <Text style={[styles.badgeText, { color: '#2563EB' }]}>
              {tarefasCount} {tarefasCount === 1 ? 'tarefa' : 'tarefas'}
            </Text>
          </View>
        ) : null}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    position: 'relative',
    width: '48%',
    backgroundColor: '#F8FAFC',
    padding: 14,
    borderRadius: 18,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  principalBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: '#059669',
    paddingVertical: 2,
    paddingHorizontal: 6,
    borderRadius: 6,
    zIndex: 2,
  },
  principalBadgeText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#FFFFFF',
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
  badgesRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 4,
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

