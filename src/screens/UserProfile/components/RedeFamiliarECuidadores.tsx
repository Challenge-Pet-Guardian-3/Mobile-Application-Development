import React from 'react';
import { View, TouchableOpacity, StyleSheet, Text } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../../routes/types';
import { useUserProfile } from '../../../hooks/useUserProfile';
import { shadows } from '../../../utils/shadow';

interface RedeFamiliarECuidadoresProps {
  navigation: NativeStackNavigationProp<RootStackParamList>;
  profile: ReturnType<typeof useUserProfile>['profile'];
}

export function RedeFamiliarECuidadores({ navigation, profile }: RedeFamiliarECuidadoresProps) {
  return (
    <View style={styles.menuBox}>
      <View style={styles.sectionHeaderRow}>
        <Text style={styles.menuSectionTitle}>Rede de Cuidado Familiar</Text>
        <TouchableOpacity onPress={() => navigation.navigate('Family')}>
          <Text style={styles.linkHeader}>Ver todos</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.familySummary}>
        <View style={styles.familyItem}>
          <MaterialCommunityIcons name="paw" size={18} color="#2563EB" />
          <Text style={styles.familyItemText}>{profile?.familySummary?.petsTexto ?? '0 animais cadastrados'}</Text>
        </View>
        <View style={styles.familyItem}>
          <MaterialCommunityIcons name="account-multiple-outline" size={18} color="#059669" />
          <Text style={styles.familyItemText}>{profile?.familySummary?.cuidadoresTexto ?? '1 cuidador ativo'}</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  menuBox: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(226, 232, 240, 0.8)',
    ...shadows.sm,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  menuSectionTitle: { fontSize: 15, fontWeight: '700', color: '#0F172A' },
  linkHeader: { fontSize: 13, color: '#2563EB', fontWeight: '600' },
  familySummary: {
    flexDirection: 'row',
    backgroundColor: '#F8FAFC',
    borderRadius: 14,
    padding: 12,
    justifyContent: 'space-around',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  familyItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  familyItemText: { fontSize: 13, fontWeight: '600', color: '#334155' },
});
