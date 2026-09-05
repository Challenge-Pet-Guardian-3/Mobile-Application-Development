import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';

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
  const displayRole = roleText || (isPrincipal ? 'Responsável Principal' : email || 'Co-cuidador');
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
        <View style={styles.nameRow}>
          <Text style={styles.name} numberOfLines={1}>
            {displayName}
          </Text>
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
        </View>
        <Text style={styles.role} numberOfLines={1}>
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
              <MaterialCommunityIcons name="crown-outline" size={16} color="#D97706" />
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
                color="#EF4444"
              />
            </TouchableOpacity>
          )}
        </View>
      )}
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
    color: '#1E293B',
    flexShrink: 1,
  },
  role: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 2,
  },
  roleBadge: {
    backgroundColor: '#EFF6FF',
    paddingVertical: 2,
    paddingHorizontal: 6,
    borderRadius: 6,
  },
  roleBadgeText: {
    fontSize: 9,
    fontWeight: '700',
    color: '#2563EB',
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
    backgroundColor: '#FEF3C7',
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionBtnRemove: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#FEE2E2',
    justifyContent: 'center',
    alignItems: 'center',
  },
});

