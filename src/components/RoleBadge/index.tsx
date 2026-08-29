import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { UsuarioRole } from '../../types/user';

interface RoleBadgeProps {
  role?: UsuarioRole;
  size?: 'sm' | 'md';
}

export function RoleBadge({ role = 'PREMIUM', size = 'sm' }: RoleBadgeProps) {
  const isPremium = role === 'PREMIUM';
  const isSmall = size === 'sm';

  return (
    <View
      style={[
        styles.badgeBase,
        isPremium ? styles.premiumBadge : styles.comumBadge,
        isSmall ? styles.badgeSmall : styles.badgeMedium,
      ]}
    >
      {isPremium ? (
        <MaterialCommunityIcons
          name="crown"
          size={isSmall ? 13 : 15}
          color="#D97706"
        />
      ) : (
        <Ionicons
          name="paw"
          size={isSmall ? 12 : 14}
          color="#2563EB"
        />
      )}
      <Text
        style={[
          styles.badgeTextBase,
          isPremium ? styles.premiumText : styles.comumText,
          isSmall ? styles.textSmall : styles.textMedium,
        ]}
      >
        {isPremium ? 'Tutor Premium ⭐' : 'Tutor Comum'}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badgeBase: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 10,
    alignSelf: 'flex-start',
  },
  badgeSmall: {
    paddingVertical: 3,
    paddingHorizontal: 10,
    gap: 4,
  },
  badgeMedium: {
    paddingVertical: 5,
    paddingHorizontal: 12,
    gap: 6,
  },
  premiumBadge: {
    backgroundColor: '#FEF3C7',
    borderWidth: 1,
    borderColor: '#F59E0B',
  },
  comumBadge: {
    backgroundColor: '#EFF6FF',
    borderWidth: 1,
    borderColor: '#BFDBFE',
  },
  badgeTextBase: {
    fontWeight: '800',
  },
  textSmall: {
    fontSize: 11,
  },
  textMedium: {
    fontSize: 12,
  },
  premiumText: {
    color: '#92400E',
  },
  comumText: {
    color: '#1E40AF',
  },
});
