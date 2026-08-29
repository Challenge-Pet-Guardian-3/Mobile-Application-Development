import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Platform,
  Linking,
  Alert,
} from 'react-native';
import { MaterialCommunityIcons, Ionicons, FontAwesome } from '@expo/vector-icons';
import { Header } from '../../components/Header';
import { CustomInput } from '../../components/CustomInput';
import { LoadingSpinner } from '../../components/LoadingSpinner';
import { EmptyState } from '../../components/EmptyState';
import { useClinics } from '../../hooks/useClinics';
import { ClinicaResponse } from '../../types/clinic';

export default function ClinicsSearchScreen() {
  const [termoBusca, setTermoBusca] = useState('');
  const [somente24h, setSomente24h] = useState(false);
  const [somenteProntoSocorro, setSomenteProntoSocorro] = useState(false);

  const { data: clinicas, isLoading } = useClinics({
    termoBusca,
    somente24h,
    somenteProntoSocorro,
  });

  const handleLigar = (telefone: string) => {
    const num = telefone.replace(/\D/g, '');
    Linking.openURL(`tel:${num}`).catch(() => {
      Alert.alert('Contato', `Telefone da clínica: ${telefone}`);
    });
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <Header subtitle="Pronto-Socorro & Atendimento 24h" />

        {/* Campo de Busca */}
        <CustomInput
          placeholder="Buscar por clínica, bairro ou especialidade..."
          value={termoBusca}
          onChangeText={setTermoBusca}
          leftIcon={<Ionicons name="search" size={18} color="#94A3B8" />}
          rightIcon={
            termoBusca !== '' ? (
              <TouchableOpacity onPress={() => setTermoBusca('')}>
                <Ionicons name="close-circle" size={18} color="#94A3B8" />
              </TouchableOpacity>
            ) : undefined
          }
        />

        {/* Filtros Rápidos */}
        <View style={styles.filtersRow}>
          <TouchableOpacity
            style={[styles.filterChip, somente24h && styles.filterChipActive]}
            onPress={() => setSomente24h(!somente24h)}
            activeOpacity={0.8}
          >
            <MaterialCommunityIcons
              name="clock-time-four-outline"
              size={15}
              color={somente24h ? '#FFFFFF' : '#EF4444'}
            />
            <Text style={[styles.filterChipText, somente24h && styles.filterChipTextActive]}>
              Aberto 24 Horas
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.filterChip, somenteProntoSocorro && styles.filterChipActive]}
            onPress={() => setSomenteProntoSocorro(!somenteProntoSocorro)}
            activeOpacity={0.8}
          >
            <MaterialCommunityIcons
              name="ambulance"
              size={15}
              color={somenteProntoSocorro ? '#FFFFFF' : '#2563EB'}
            />
            <Text style={[styles.filterChipText, somenteProntoSocorro && styles.filterChipTextActive]}>
              Pronto-Socorro
            </Text>
          </TouchableOpacity>
        </View>

        {/* Lista de Clínicas */}
        {isLoading ? (
          <LoadingSpinner message="Localizando clínicas veterinárias..." />
        ) : (clinicas || []).length === 0 ? (
          <EmptyState
            iconName="hospital-box-outline"
            iconColor="#94A3B8"
            title="Nenhuma clínica encontrada"
            description="Tente alterar os filtros ou o termo de busca para encontrar unidades próximas."
          />
        ) : (
          (clinicas || []).map((clinica: ClinicaResponse) => (
            <View
              key={clinica.id}
              style={[styles.clinicCard, clinica.patrocinada && styles.clinicCardSponsored]}
            >
              {clinica.patrocinada && (
                <View style={styles.sponsoredBadge}>
                  <MaterialCommunityIcons name="crown" size={12} color="#D97706" />
                  <Text style={styles.sponsoredBadgeText}>Parceira Clyvo Destaque</Text>
                </View>
              )}

              <View style={styles.clinicMainRow}>
                <View style={styles.clinicInfo}>
                  <Text style={styles.clinicName}>{clinica.nome}</Text>
                  <Text style={styles.clinicAddress}>
                    {clinica.rua}, {clinica.numero} • {clinica.bairro} ({clinica.distanciaKm} km)
                  </Text>

                  <View style={styles.ratingRow}>
                    <FontAwesome name="star" size={13} color="#FBBF24" />
                    <Text style={styles.ratingText}>{clinica.avaliacao.toFixed(1)}</Text>

                    {clinica.atendimento24h && (
                      <View style={styles.badge24h}>
                        <Text style={styles.badge24hText}>24 Horas</Text>
                      </View>
                    )}

                    {clinica.prontoSocorro && (
                      <View style={styles.badgePS}>
                        <Text style={styles.badgePSText}>Emergência</Text>
                      </View>
                    )}
                  </View>
                </View>

                <TouchableOpacity
                  style={styles.btnCall}
                  onPress={() => handleLigar(clinica.telefone)}
                  activeOpacity={0.8}
                >
                  <Ionicons name="call" size={18} color="#FFFFFF" />
                </TouchableOpacity>
              </View>

              {/* Especialidades */}
              <View style={styles.specialtiesRow}>
                {clinica.especialidades.map((esp, i) => (
                  <View key={i} style={styles.specialtyChip}>
                    <Text style={styles.specialtyChipText}>{esp}</Text>
                  </View>
                ))}
              </View>
            </View>
          ))
        )}

        <View style={{ height: 110 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC', paddingTop: Platform.OS === 'ios' ? 50 : 25 },
  scrollContent: { paddingHorizontal: 20, paddingTop: 10, gap: 14 },
  filtersRow: { flexDirection: 'row', gap: 8, marginBottom: 4 },
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingVertical: 7,
    paddingHorizontal: 12,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(226, 232, 240, 0.8)',
    gap: 6,
  },
  filterChipActive: { backgroundColor: '#0F172A', borderColor: '#0F172A' },
  filterChipText: { fontSize: 12, fontWeight: '700', color: '#475569' },
  filterChipTextActive: { color: '#FFFFFF' },
  clinicCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 22,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(226, 232, 240, 0.8)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.03,
    shadowRadius: 10,
    elevation: 2,
  },
  clinicCardSponsored: { borderColor: '#FED7AA', backgroundColor: '#FFFDF9' },
  sponsoredBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF3C7',
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: 8,
    alignSelf: 'flex-start',
    gap: 4,
    marginBottom: 8,
  },
  sponsoredBadgeText: { fontSize: 10, fontWeight: '800', color: '#B45309' },
  clinicMainRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  clinicInfo: { flex: 1, paddingRight: 10 },
  clinicName: { fontSize: 15, fontWeight: '800', color: '#0F172A' },
  clinicAddress: { fontSize: 12, color: '#64748B', marginTop: 2, marginBottom: 6 },
  ratingRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  ratingText: { fontSize: 12, fontWeight: '800', color: '#1E293B' },
  badge24h: { backgroundColor: '#FEF2F2', paddingVertical: 2, paddingHorizontal: 6, borderRadius: 6 },
  badge24hText: { fontSize: 10, fontWeight: '800', color: '#EF4444' },
  badgePS: { backgroundColor: '#EFF6FF', paddingVertical: 2, paddingHorizontal: 6, borderRadius: 6 },
  badgePSText: { fontSize: 10, fontWeight: '800', color: '#2563EB' },
  btnCall: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#10B981',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#10B981',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 2,
  },
  specialtiesRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 12, borderTopWidth: 1, borderTopColor: '#F1F5F9', paddingTop: 10 },
  specialtyChip: { backgroundColor: '#F8FAFC', paddingVertical: 3, paddingHorizontal: 8, borderRadius: 8, borderWidth: 1, borderColor: '#EDF2F7' },
  specialtyChipText: { fontSize: 10, color: '#64748B', fontWeight: '600' },
});
