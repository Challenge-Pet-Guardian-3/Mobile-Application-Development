import React, { memo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

export interface DiaOfensiva {
  dia: string;
  numero: number;
  ativo: boolean;
  ehHoje?: boolean;
}

export interface StreakCardProps {
  streakDays: DiaOfensiva[] | boolean[];
  totalStreak: number;
}

export const StreakCard = memo(function StreakCard({ streakDays, totalStreak }: StreakCardProps) {
  const siglas = ['S', 'T', 'Q', 'Q', 'S', 'S', 'D'];
  const hoje = new Date();
  const diaSemanaIndex = (hoje.getDay() + 6) % 7;
  const segunda = new Date(hoje);
  segunda.setDate(hoje.getDate() - diaSemanaIndex);

  const dias: DiaOfensiva[] = Array.isArray(streakDays)
    ? streakDays.map((item, index) => {
        if (typeof item === 'boolean') {
          const data = new Date(segunda);
          data.setDate(segunda.getDate() + index);
          return {
            dia: siglas[index] || 'S',
            numero: data.getDate(),
            ativo: item,
            ehHoje: index === diaSemanaIndex,
          };
        }
        return item;
      })
    : [];

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <Text style={styles.titulo}>Ofensiva da Semana</Text>
        <View style={styles.badgeOfensiva}>
          <MaterialCommunityIcons name="fire" size={18} color="#FF9600" />
          <Text style={styles.badgeTexto}>{totalStreak} {totalStreak === 1 ? 'dia' : 'dias'}</Text>
        </View>
      </View>

      <View style={styles.diasContainer}>
        {dias.map((item, index) => {
          const isAtivo = item.ativo;

          return (
            <View key={`streak-item-${index}-${item.numero}`} style={styles.colunaDia}>
              <View style={[styles.gotaContainer, isAtivo ? styles.gotaAtiva : styles.gotaInativa]}>
                <MaterialCommunityIcons
                  name="water"
                  size={16}
                  color={isAtivo ? '#FFF' : '#A0AEC0'}
                  style={{ marginBottom: -2 }}
                />
                <Text style={[styles.numeroTexto, isAtivo ? styles.numeroAtivo : styles.numeroInativo]}>
                  {item.numero}
                </Text>
              </View>

              <Text style={styles.diaTexto}>{item.dia}</Text>
            </View>
          );
        })}
      </View>
    </View>
  );
});

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFF',
    borderRadius: 24,
    padding: 20,
    borderWidth: 1,
    borderColor: '#EDF2F7',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  titulo: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1E293B',
  },
  badgeOfensiva: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF7ED',
    borderWidth: 1,
    borderColor: '#FFEDD5',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 20,
    gap: 4,
  },
  badgeTexto: {
    fontSize: 13,
    fontWeight: '700',
    color: '#EA580C',
  },
  diasContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  colunaDia: {
    alignItems: 'center',
    gap: 8,
  },
  gotaContainer: {
    width: 36,
    height: 48,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 4,
  },
  gotaAtiva: {
    backgroundColor: '#58CC02',
  },
  gotaInativa: {
    backgroundColor: '#EDF2F7',
  },
  numeroTexto: {
    fontSize: 11,
    fontWeight: '700',
  },
  numeroAtivo: {
    color: '#FFF',
  },
  numeroInativo: {
    color: '#718096',
  },
  diaTexto: {
    fontSize: 12,
    fontWeight: '600',
    color: '#A0AEC0',
  },
});