import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { shadows } from '../../../utils/shadow';

interface ContaESuporteProps {
  onOpenFaq: () => void;
  onOpenTerms: () => void;
  onLogout: () => void;
}

export function ContaESuporte({ onOpenFaq, onOpenTerms, onLogout }: ContaESuporteProps) {
  return (
    <View style={styles.menuBox}>
      <Text style={styles.menuSectionTitle}>Conta & Suporte</Text>

      <TouchableOpacity style={styles.menuItem} onPress={onOpenFaq} activeOpacity={0.7}>
        <View style={[styles.menuIconWrapper, { backgroundColor: '#F1F5F9' }]}>
          <Ionicons name="help-circle-outline" size={20} color="#475569" />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.menuText}>Perguntas Frequentes (FAQ)</Text>
          <Text style={styles.menuSubText}>Dúvidas sobre o funcionamento</Text>
        </View>
        <Ionicons name="chevron-forward" size={16} color="#CBD5E1" />
      </TouchableOpacity>

      <TouchableOpacity style={styles.menuItem} onPress={onOpenTerms} activeOpacity={0.7}>
        <View style={[styles.menuIconWrapper, { backgroundColor: '#F1F5F9' }]}>
          <Ionicons name="document-text-outline" size={20} color="#475569" />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.menuText}>Termos de Uso & Privacidade</Text>
          <Text style={styles.menuSubText}>Diretrizes do ecossistema Clyvo</Text>
        </View>
        <Ionicons name="chevron-forward" size={16} color="#CBD5E1" />
      </TouchableOpacity>

      <TouchableOpacity style={[styles.menuItem, { borderBottomWidth: 0 }]} onPress={onLogout} activeOpacity={0.7}>
        <View style={[styles.menuIconWrapper, { backgroundColor: '#FEF2F2' }]}>
          <Ionicons name="log-out-outline" size={20} color="#EF4444" />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={[styles.menuText, { color: '#EF4444' }]}>Encerrar Sessão (Logout)</Text>
          <Text style={styles.menuSubText}>Desconectar deste dispositivo</Text>
        </View>
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
