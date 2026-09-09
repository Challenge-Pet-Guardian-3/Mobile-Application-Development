import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../../routes/types';
import { shadows } from '../../../utils/shadow';

interface RecursosPetGuardianProps {
  navigation: NativeStackNavigationProp<RootStackParamList>;
}

export function RecursosPetGuardian({ navigation }: RecursosPetGuardianProps) {
  return (
    <View style={styles.menuBox}>
      <Text style={styles.menuSectionTitle}>Recursos PetGuardian</Text>

      <TouchableOpacity
        style={[styles.menuItem, { borderBottomWidth: 0 }]}
        onPress={() => navigation.navigate('IA')}
        activeOpacity={0.7}
      >
        <View style={[styles.menuIconWrapper, { backgroundColor: '#EFF6FF' }]}>
          <MaterialCommunityIcons name="robot-outline" size={20} color="#2563EB" />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.menuText}>Assistente de IA Preventiva</Text>
          <Text style={styles.menuSubText}>Orientações sobre saúde e rotina do pet</Text>
        </View>
        <Ionicons name="chevron-forward" size={16} color="#CBD5E1" />
      </TouchableOpacity>
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
  menuSectionTitle: { fontSize: 15, fontWeight: '700', color: '#0F172A', marginBottom: 12 },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
    gap: 12,
  },
  menuIconWrapper: {
    width: 36,
    height: 36,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  menuText: { fontSize: 14, fontWeight: '600', color: '#1E293B' },
  menuSubText: { fontSize: 11, color: '#94A3B8', marginTop: 1 },
});
