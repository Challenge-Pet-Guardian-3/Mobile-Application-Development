import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { shadows } from '../../../utils/shadow';
import { useUserProfile } from '../../../hooks/useUserProfile';

interface StatCardProps {
  iconName: React.ComponentProps<typeof MaterialCommunityIcons>['name'];
  iconColor: string;
  iconBgColor: string;
  value: string | number;
  label: string;
}

function StatCard({ iconName, iconColor, iconBgColor, value, label }: StatCardProps) {
  return (
    <View style={styles.card}>
      <View style={[styles.iconBox, { backgroundColor: iconBgColor }]}>
        <MaterialCommunityIcons name={iconName} size={18} color={iconColor} />
      </View>
      <Text style={styles.value}>{value}</Text>
      <Text style={styles.label}>{label}</Text>
    </View>
  );
}

interface EstatisticasPerfilProps {
  profile: ReturnType<typeof useUserProfile>['profile'];
}

export function EstatisticasPerfil({ profile }: EstatisticasPerfilProps) {
  const { pontosTotais, redeCuidado } = profile;

  return (
    <View style={styles.statsRow}>
      <StatCard
        iconName="star"
        iconColor="#D97706"
        iconBgColor="#FFF7ED"
        value={pontosTotais !== undefined ? `${pontosTotais}` : '0'}
        label="Pontos XP"
      />
      <StatCard
        iconName="paw"
        iconColor="#2563EB"
        iconBgColor="#EFF6FF"
        value={redeCuidado?.pets?.length ? `${redeCuidado.pets.length}` : '0'}
        label="Pets Família"
      />
      <StatCard
        iconName="check-circle"
        iconColor="#059669"
        iconBgColor="#ECFDF5"
        value={redeCuidado?.totalTarefasConcluidas ? `${redeCuidado.totalTarefasConcluidas}` : '0'}
        label="Concluídas"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  statsRow: {
    flexDirection: 'row',
    gap: 10,
  },
  card: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    paddingVertical: 14,
    paddingHorizontal: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(226, 232, 240, 0.8)',
    ...shadows.xs,
    elevation: 1,
  },
  iconBox: {
    width: 36,
    height: 36,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  value: {
    fontSize: 18,
    fontWeight: '900',
    color: '#0F172A',
  },
  label: {
    fontSize: 11,
    color: '#64748B',
    fontWeight: '600',
    marginTop: 2,
  },
});
