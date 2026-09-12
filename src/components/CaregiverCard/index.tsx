import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { colors, spacing, borderRadius } from '../../constants/theme';

interface CaregiverCardProps {
  nome: string;
  email?: string;
  roleText?: string;
  isCurrentUser?: boolean;
  isPrincipal?: boolean;
  onPress?: () => void;
  onTransfer?: () => void;
  onRemove?: () => void;
}

export function CaregiverCard({
  nome,
  email,
  roleText,
  isCurrentUser = false,
  isPrincipal = false,
  onPress,
  onTransfer,
  onRemove,
}: CaregiverCardProps) {
  const initials = (nome || 'TU').substring(0, 2).toUpperCase();
  const displayName = isCurrentUser ? `${nome} (Você)` : nome;
  const displayRole = roleText || (isPrincipal ? 'Tutor Principal' : email || 'Co-cuidador');
  const badgeLabel = isPrincipal ? 'Tutor Principal' : 'Co-cuidador';

  const CardWrapper = onPress ? TouchableOpacity : View;

  return (
    <CardWrapper
      style={styles.card}
      onPress={onPress}
      activeOpacity={onPress ? 0.7 : 1}
    >
      <View
        style={[
          styles.avatar,
          !isPrincipal && { backgroundColor: colors.neutral[100] },
        ]}
      >
        <Text
          style={[
            styles.initials,
            !isPrincipal && { color: colors.neutral[600] },
          ]}
        >
          {initials}
        </Text>
      </View>

      <View style={styles.infoWrapper}>
        <View style={styles.nameRow}>
          <Text style={styles.name} numberOfLines={1}>
            {displayName}
          </Text>
          <View
            style={[
              styles.roleBadge,
              !isPrincipal && { backgroundColor: colors.neutral[100] },
            ]}
          >
            <Text
              style={[
                styles.roleBadgeText,
                !isPrincipal && { color: colors.neutral[500] },
              ]}
            >
              {badgeLabel}
            </Text>
          </View>
        </View>
        <Text style={styles.role} numberOfLines={2}>
          {displayRole}
        </Text>
      </View>

      {/* Ações de Gestão do Cuidador */}
      {(onTransfer || onRemove) && (
        <View style={styles.actionsContainer}>
          {onTransfer && (
            <TouchableOpacity
              style={styles.actionBtnTransfer}
              onPress={onTransfer}
              activeOpacity={0.7}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <MaterialCommunityIcons name="crown-outline" size={16} color={colors.warning[600]} />
            </TouchableOpacity>
          )}

          {onRemove && (
            <TouchableOpacity
              style={styles.actionBtnRemove}
              onPress={onRemove}
              activeOpacity={0.7}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <Ionicons
                name={isCurrentUser ? 'exit-outline' : 'trash-outline'}
                size={15}
                color={colors.danger[500]}
              />
            </TouchableOpacity>
          )}
        </View>
      )}

      {onPress && !onTransfer && !onRemove && (
        <Ionicons name="chevron-forward" size={18} color={colors.neutral[400]} />
      )}
    </CardWrapper>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.neutral[100],
    gap: spacing.md,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.primary[50],
    justifyContent: 'center',
    alignItems: 'center',
  },
  initials: {
    fontSize: 14,
    fontWeight: '800',
    color: colors.primary[600],
  },
  infoWrapper: {
    flex: 1,
    justifyContent: 'center',
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  name: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.neutral[800],
    flexShrink: 1,
  },
  role: {
    fontSize: 11,
    color: colors.neutral[500],
    marginTop: 2,
  },
  roleBadge: {
    backgroundColor: colors.primary[50],
    paddingVertical: 2,
    paddingHorizontal: 6,
    borderRadius: borderRadius.xs,
  },
  roleBadgeText: {
    fontSize: 9,
    fontWeight: '700',
    color: colors.primary[600],
  },
  actionsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  actionBtnTransfer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.warning[100],
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionBtnRemove: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.danger[100],
    justifyContent: 'center',
    alignItems: 'center',
  },
});

