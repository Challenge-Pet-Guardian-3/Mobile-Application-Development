import React, { memo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

interface PetScoreBarProps {
  score: number;
  maxScore?: number;
  petName?: string;
  level?: number;
}

export const PetScoreBar = memo(function PetScoreBar({
  score,
  maxScore = 100,
  petName = 'Pet',
  level = 1,
}: PetScoreBarProps) {
  const percentage = Math.min(Math.max((score / maxScore) * 100, 0), 100);

  // Status de bem-estar suave
  let statusTexto = 'Precisa de Atenção';
  let statusCor = '#EF4444';
  let statusBg = '#FEF2F2';

  if (percentage >= 70) {
    statusTexto = 'Excelente & Radiante ✨';
    statusCor = '#10B981';
    statusBg = '#ECFDF5';
  } else if (percentage >= 40) {
    statusTexto = 'Bem Cuidado 👍';
    statusCor = '#F59E0B';
    statusBg = '#FFFBEB';
  }

  return (
    <View style={styles.card}>
      <View style={styles.headerRow}>
        <View style={styles.infoLeft}>
          <View style={styles.iconCircle}>
            <MaterialCommunityIcons name="heart-pulse" size={22} color="#2563EB" />
          </View>
          <View>
            <Text style={styles.petTitle}>Bem-estar de {petName}</Text>
            <View style={[styles.statusPill, { backgroundColor: statusBg }]}>
              <Text style={[styles.statusText, { color: statusCor }]}>{statusTexto}</Text>
            </View>
          </View>
        </View>

        <View style={styles.levelBadge}>
          <Text style={styles.levelLabel}>NÍVEL</Text>
          <Text style={styles.levelVal}>{level}</Text>
        </View>
      </View>

      <View style={styles.progressContainer}>
        <View style={styles.progressBarBackground}>
          <View style={[styles.progressBarFill, { width: `${percentage}%` }]} />
        </View>
      </View>

      <View style={styles.footerRow}>
        <Text style={styles.pointsLabel}>Score do Pet</Text>
        <Text style={styles.pointsValue}>
          <Text style={styles.currentPoints}>{score}</Text> / {maxScore} pts
        </Text>
      </View>
    </View>
  );
});

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(226, 232, 240, 0.8)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.03,
    shadowRadius: 10,
    elevation: 2,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  infoLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  iconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#EFF6FF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  petTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0F172A',
  },
  statusPill: {
    alignSelf: 'flex-start',
    paddingVertical: 2,
    paddingHorizontal: 8,
    borderRadius: 8,
    marginTop: 4,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '700',
  },
  levelBadge: {
    backgroundColor: '#0F172A',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 14,
    alignItems: 'center',
  },
  levelLabel: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  levelVal: {
    color: '#FFFFFF',
    fontWeight: '900',
    fontSize: 14,
  },
  progressContainer: {
    marginBottom: 10,
  },
  progressBarBackground: {
    height: 10,
    backgroundColor: '#F1F5F9',
    borderRadius: 5,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#2563EB',
    borderRadius: 5,
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  pointsLabel: {
    fontSize: 12,
    color: '#64748B',
    fontWeight: '600',
  },
  pointsValue: {
    fontSize: 13,
    color: '#64748B',
    fontWeight: '600',
  },
  currentPoints: {
    color: '#2563EB',
    fontWeight: '800',
    fontSize: 15,
  },
});
