import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { UsuarioRole } from '../../types/user';

interface RoleSelectorProps {
  value: UsuarioRole;
  onChange: (role: UsuarioRole) => void;
  variant?: 'cards' | 'compact';
  label?: string;
}

export function RoleSelector({
  value,
  onChange,
  variant = 'cards',
  label = 'Escolha seu Perfil de Tutor:',
}: RoleSelectorProps) {
  const isCompact = variant === 'compact';

  if (isCompact) {
    return (
      <View style={styles.compactContainer}>
        {label ? <Text style={styles.compactLabel}>{label}</Text> : null}
        <View style={styles.compactRow}>
          <TouchableOpacity
            style={[
              styles.compactCard,
              value === 'COMUM' && styles.compactCardActive,
            ]}
            onPress={() => onChange('COMUM')}
            activeOpacity={0.8}
          >
            <Ionicons
              name="paw"
              size={16}
              color={value === 'COMUM' ? '#2563EB' : '#64748B'}
            />
            <Text
              style={[
                styles.compactCardText,
                value === 'COMUM' && styles.compactCardTextActive,
              ]}
            >
              Comum
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.compactCard,
              value === 'PREMIUM' && styles.compactCardActivePremium,
            ]}
            onPress={() => onChange('PREMIUM')}
            activeOpacity={0.8}
          >
            <MaterialCommunityIcons
              name="crown"
              size={16}
              color={value === 'PREMIUM' ? '#D97706' : '#64748B'}
            />
            <Text
              style={[
                styles.compactCardText,
                value === 'PREMIUM' && styles.compactCardTextActivePremium,
              ]}
            >
              Premium ⭐
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {label ? <Text style={styles.label}>{label}</Text> : null}
      <View style={styles.row}>
        {/* Opção Comum */}
        <TouchableOpacity
          style={[styles.card, value === 'COMUM' && styles.cardActive]}
          onPress={() => onChange('COMUM')}
          activeOpacity={0.8}
        >
          <View style={styles.headerRow}>
            <Ionicons
              name="paw"
              size={20}
              color={value === 'COMUM' ? '#2563EB' : '#64748B'}
            />
            <Text
              style={[
                styles.title,
                value === 'COMUM' && styles.titleActive,
              ]}
            >
              Comum
            </Text>
          </View>
          <Text style={styles.description}>
            Rotinas, cuidados e histórico do pet
          </Text>
          <View
            style={[
              styles.badge,
              value === 'COMUM' ? styles.badgeActive : styles.badgeInactive,
            ]}
          >
            <Text
              style={[
                styles.badgeText,
                value === 'COMUM' && styles.badgeTextActive,
              ]}
            >
              Gratuito
            </Text>
          </View>
        </TouchableOpacity>

        {/* Opção Premium */}
        <TouchableOpacity
          style={[
            styles.card,
            value === 'PREMIUM' && styles.cardActivePremium,
          ]}
          onPress={() => onChange('PREMIUM')}
          activeOpacity={0.8}
        >
          <View style={styles.headerRow}>
            <MaterialCommunityIcons
              name="crown"
              size={20}
              color={value === 'PREMIUM' ? '#D97706' : '#64748B'}
            />
            <Text
              style={[
                styles.title,
                value === 'PREMIUM' && styles.titleActivePremium,
              ]}
            >
              Premium
            </Text>
          </View>
          <Text style={styles.description}>
            Trilhas, módulos, aulas e IA Assistente
          </Text>
          <View
            style={[
              styles.badge,
              value === 'PREMIUM'
                ? styles.badgeActivePremium
                : styles.badgeInactive,
            ]}
          >
            <Text
              style={[
                styles.badgeText,
                value === 'PREMIUM' && styles.badgeTextActivePremium,
              ]}
            >
              ⭐ Completo
            </Text>
          </View>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 18,
  },
  label: {
    fontSize: 13,
    fontWeight: '700',
    color: '#334155',
    marginBottom: 8,
  },
  row: {
    flexDirection: 'row',
    gap: 10,
  },
  card: {
    flex: 1,
    padding: 12,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#E2E8F0',
    backgroundColor: '#F8FAFC',
    justifyContent: 'space-between',
  },
  cardActive: {
    borderColor: '#2563EB',
    backgroundColor: '#EFF6FF',
  },
  cardActivePremium: {
    borderColor: '#F59E0B',
    backgroundColor: '#FFFBEB',
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  title: {
    fontSize: 14,
    fontWeight: '800',
    color: '#64748B',
  },
  titleActive: {
    color: '#1E40AF',
  },
  titleActivePremium: {
    color: '#B45309',
  },
  description: {
    fontSize: 11,
    color: '#64748B',
    lineHeight: 14,
    marginBottom: 8,
  },
  badge: {
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  badgeInactive: {
    backgroundColor: '#E2E8F0',
  },
  badgeActive: {
    backgroundColor: '#DBEAFE',
  },
  badgeActivePremium: {
    backgroundColor: '#FDE68A',
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#64748B',
  },
  badgeTextActive: {
    color: '#1E40AF',
  },
  badgeTextActivePremium: {
    color: '#92400E',
  },
  // Compact Variant
  compactContainer: {
    marginBottom: 14,
  },
  compactLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#334155',
    marginBottom: 6,
  },
  compactRow: {
    flexDirection: 'row',
    gap: 8,
  },
  compactCard: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    paddingHorizontal: 8,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    backgroundColor: '#F8FAFC',
  },
  compactCardActive: {
    borderColor: '#2563EB',
    backgroundColor: '#EFF6FF',
  },
  compactCardActivePremium: {
    borderColor: '#F59E0B',
    backgroundColor: '#FFFBEB',
  },
  compactCardText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#64748B',
  },
  compactCardTextActive: {
    color: '#1E40AF',
    fontWeight: '800',
  },
  compactCardTextActivePremium: {
    color: '#92400E',
    fontWeight: '800',
  },
});
