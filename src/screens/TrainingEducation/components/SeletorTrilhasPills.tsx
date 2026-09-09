import React from 'react';
import { ScrollView, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { useTrainings } from '../../../hooks/useTrainings';

interface SeletorTrilhasPillsProps {
  trail: ReturnType<typeof useTrainings>['trail'];
}

export function SeletorTrilhasPills({ trail }: SeletorTrilhasPillsProps) {
  const { trilhas, trilhaAtivaIndex, setTrilhaAtivaIndex } = trail;

  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.trackPillsScroll}>
      {(trilhas ?? []).map((t, idx) => (
        <TouchableOpacity
          key={t.id}
          style={[styles.trackPill, trilhaAtivaIndex === idx && { backgroundColor: t.cor, borderColor: t.cor }]}
          onPress={() => setTrilhaAtivaIndex(idx)}
        >
          <Text style={[styles.trackPillText, trilhaAtivaIndex === idx && styles.trackPillTextActive]}>
            {t?.titulo}
          </Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  trackPillsScroll: {
    paddingHorizontal: 20,
    gap: 10,
    marginBottom: 20,
  },
  trackPill: {
    backgroundColor: '#FFF',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
  },
  trackPillText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#475569',
  },
  trackPillTextActive: {
    color: '#FFF',
    fontWeight: '900',
  },
});
