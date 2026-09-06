import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { PetResponse } from '../../types/pet';
import { colors, spacing, borderRadius } from '../../constants/theme';

export interface PetCardProps {
  pet: PetResponse;
  isResponsavelPrincipal?: boolean;
  tarefasCount?: number;
  pontosTotais?: number;
  onPress?: () => void;
}

export function PetCard({ pet, isResponsavelPrincipal, tarefasCount, pontosTotais, onPress }: PetCardProps) {
  return (
    <TouchableOpacity
      style={styles.card}
      onPress={onPress}
      activeOpacity={0.85}
      disabled={!onPress}
    >
      {isResponsavelPrincipal && (
        <View style={styles.principalBadge}>
          <Ionicons name="shield-checkmark" size={10} color={colors.neutral.white} />
          <Text style={styles.principalBadgeText}>Tutor Princ.</Text>
        </View>
      )}

      <View style={styles.avatarWrapper}>
        <MaterialCommunityIcons name="paw" size={24} color={colors.primary[600]} />
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
          <View style={[styles.badge, { backgroundColor: colors.primary[50] }]}>
            <Text style={[styles.badgeText, { color: colors.primary[600] }]}>
              {tarefasCount} {tarefasCount === 1 ? 'tarefa' : 'tarefas'}
            </Text>
          </View>
        ) : null}
        {pontosTotais !== undefined ? (
          <View style={[styles.badge, { backgroundColor: colors.warning[50] }]}>
            <Text style={[styles.badgeText, { color: colors.warning[600] }]}>
              {pontosTotais} XP
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
    backgroundColor: colors.neutral[50],
    padding: 14,
    borderRadius: borderRadius.xl,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.neutral[200],
  },
  principalBadge: {
    position: 'absolute',
    top: spacing.xs,
    right: spacing.xs,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: colors.success[600],
    paddingVertical: 2,
    paddingHorizontal: 6,
    borderRadius: borderRadius.xs,
    zIndex: 2,
  },
  principalBadgeText: {
    fontSize: 9,
    fontWeight: '800',
    color: colors.neutral.white,
  },
  avatarWrapper: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: colors.primary[50],
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
    marginBottom: spacing.xs,
  },
  name: {
    fontSize: 14,
    fontWeight: '800',
    color: colors.neutral[800],
  },
  breed: {
    fontSize: 11,
    color: colors.neutral[500],
    marginTop: 2,
    marginBottom: spacing.xs,
  },
  badgesRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 4,
  },
  badge: {
    backgroundColor: colors.neutral[200],
    paddingVertical: 3,
    paddingHorizontal: spacing.xs,
    borderRadius: borderRadius.sm,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.neutral[600],
  },
});
