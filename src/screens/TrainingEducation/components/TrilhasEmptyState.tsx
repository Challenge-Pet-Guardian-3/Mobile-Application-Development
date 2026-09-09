import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
import { PetResponse } from '../../../types/pet';

interface TrilhasEmptyStateProps {
  petAtivo?: PetResponse;
}

export function TrilhasEmptyState({ petAtivo }: TrilhasEmptyStateProps) {
  return (
    <View style={styles.emptyContainer}>
      <View style={styles.emptyIconCircle}>
        <MaterialCommunityIcons name="book-open-page-variant-outline" size={44} color="#2563EB" />
      </View>
      <Text style={styles.emptyTitle}>Nenhuma Trilha Disponível</Text>
      <Text style={styles.emptyDesc}>
        Ainda não há trilhas ou módulos educativos cadastrados para {petAtivo?.nome || 'este pet'}.
      </Text>
      <View style={styles.emptyInfoBox}>
        <Ionicons name="information-circle-outline" size={20} color="#0284C7" />
        <Text style={styles.emptyInfoText}>
          O administrador do sistema disponibilizará novos módulos e aulas personalizadas em breve!
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFF',
    marginHorizontal: 20,
    marginTop: 20,
    padding: 30,
    borderRadius: 24,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    elevation: 2,
  },
  emptyIconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#EFF6FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: '#1E293B',
    marginBottom: 8,
    textAlign: 'center',
  },
  emptyDesc: {
    fontSize: 13,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 19,
    marginBottom: 20,
  },
  emptyInfoBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: '#F0F9FF',
    padding: 14,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#BAE6FD',
  },
  emptyInfoText: {
    flex: 1,
    fontSize: 12,
    color: '#0369A1',
    lineHeight: 17,
    fontWeight: '600',
  },
});
