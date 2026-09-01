import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';

interface CaregiverCardProps {
  nome: string;
  email?: string;
  roleText?: string;
  isCurrentUser?: boolean;
  isPrincipal?: boolean;
  onPress?: () => void;
}

export function CaregiverCard({
  nome,
  email,
  roleText,
  isCurrentUser = false,
  isPrincipal = false,
  onPress,
}: CaregiverCardProps) {
  const initials = (nome || 'TU').substring(0, 2).toUpperCase();
  const displayName = isCurrentUser ? `${nome} (Você)` : nome;
  const displayRole = roleText || (isPrincipal ? 'Responsável Principal' : email || 'Co-cuidador');
  const badgeLabel = isPrincipal ? 'Tutor' : 'Co-cuidador';

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
          !isPrincipal && { backgroundColor: '#F1F5F9' },
        ]}
      >
        <Text
          style={[
            styles.initials,
            !isPrincipal && { color: '#475569' },
          ]}
        >
          {initials}
        </Text>
      </View>

      <View style={styles.infoWrapper}>
        <Text style={styles.name} numberOfLines={1}>
          {displayName}
        </Text>
        <Text style={styles.role} numberOfLines={1}>
          {displayRole}
        </Text>
      </View>

      <View
        style={[
          styles.roleBadge,
          !isPrincipal && { backgroundColor: '#F1F5F9' },
        ]}
      >
        <Text
          style={[
            styles.roleBadgeText,
            !isPrincipal && { color: '#64748B' },
          ]}
        >
          {badgeLabel}
        </Text>
      </View>
    </CardWrapper>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
    gap: 12,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#EFF6FF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  initials: {
    fontSize: 14,
    fontWeight: '800',
    color: '#2563EB',
  },
  infoWrapper: {
    flex: 1,
  },
  name: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1E293B',
  },
  role: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 2,
  },
  roleBadge: {
    backgroundColor: '#EFF6FF',
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: 8,
  },
  roleBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#2563EB',
  },
});
