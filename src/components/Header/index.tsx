import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { MaterialCommunityIcons, FontAwesome5 } from '@expo/vector-icons';
import { useSession } from '../../hooks/useSession';

export type HeaderProps = {
  title?: string;
  subtitle?: string;
  onRightPress?: () => void;
};

export function Header({ title, subtitle, onRightPress }: HeaderProps) {
  const { user } = useSession();
  const userName = user?.nome ? user.nome.split(' ')[0] : 'Tutor';

  return (
    <View style={styles.container}>
      <View style={styles.leftColumn}>
        <View style={styles.brandRow}>
          <View style={styles.brandIconWrapper}>
            <FontAwesome5 name="paw" size={13} color="#2563EB" />
          </View>
          <Text style={styles.brandText}>PetGuardian</Text>
        </View>
        <Text style={styles.pageTitle}>{title || `Olá, ${userName}`}</Text>
        {subtitle ? <Text style={styles.pageSubtitle}>{subtitle}</Text> : null}
      </View>

      <TouchableOpacity
        style={styles.profileBadge}
        onPress={onRightPress}
        activeOpacity={0.8}
      >
        <View style={styles.avatarCircle}>
          <Text style={styles.avatarText}>
            {userName.substring(0, 2).toUpperCase()}
          </Text>
        </View>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    marginBottom: 8,
  },
  leftColumn: {
    flex: 1,
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  brandIconWrapper: {
    width: 22,
    height: 22,
    borderRadius: 7,
    backgroundColor: '#EFF6FF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  brandText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#2563EB',
    letterSpacing: 0.3,
  },
  pageTitle: {
    fontSize: 22,
    fontWeight: '900',
    color: '#0F172A',
    letterSpacing: -0.5,
  },
  pageSubtitle: {
    fontSize: 13,
    color: '#64748B',
    marginTop: 2,
  },
  profileBadge: {
    padding: 2,
  },
  avatarCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#0F172A',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3,
  },
  avatarText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '800',
  },
});