import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { CaregiverCard } from '../../../components/CaregiverCard';
import { colors, spacing, borderRadius } from '../../../constants/theme';
import { shadows } from '../../../utils/shadow';
import { useFamilyCare } from '../../../hooks/useFamilyCare';

interface FamilyCaregiversSectionProps {
  family: ReturnType<typeof useFamilyCare>['family'];
  onInvite: () => void;
  onManageCaregiver: (caregiver: ReturnType<typeof useFamilyCare>['family']['coCuidadores'][number]) => void;
}

export function FamilyCaregiversSection({
  family,
  onInvite,
  onManageCaregiver,
}: FamilyCaregiversSectionProps) {
  const { user, coCuidadores, petsOndeSouPrincipal } = family;
  const isPrincipal = (petsOndeSouPrincipal?.length ?? 0) > 0;

  return (
    <View style={styles.sectionBox}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Rede de Cuidados</Text>
        {isPrincipal && (
          <TouchableOpacity style={styles.btnInvite} onPress={onInvite} activeOpacity={0.8}>
            <Ionicons name="person-add" size={14} color="#2563EB" />
            <Text style={styles.btnInviteText}>Convidar</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Meu perfil */}
      {user && (
        <CaregiverCard
          nome={user?.nome || 'Tutor'}
          email={user?.email}
          roleText={isPrincipal ? 'Responsável Principal' : 'Co-cuidador Familiar'}
          isCurrentUser
          isPrincipal={isPrincipal}
        />
      )}

      {/* Co-cuidadores */}
      {(coCuidadores ?? []).map((c) => (
        <CaregiverCard
          key={c.id}
          nome={c.nome}
          email={c.email}
          roleText={c.roleText}
          isPrincipal={Boolean(c.responsavelPrincipal)}
          onPress={isPrincipal ? () => onManageCaregiver(c) : undefined}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  sectionBox: {
    backgroundColor: colors.neutral.white,
    borderRadius: borderRadius.xxl,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: 'rgba(226, 232, 240, 0.8)',
    ...shadows.sm,
    elevation: 2,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.neutral[900],
  },
  btnInvite: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary[50],
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
    borderRadius: borderRadius.md,
    gap: 4,
  },
  btnInviteText: {
    color: colors.primary[600],
    fontWeight: '800',
    fontSize: 12,
  },
});
