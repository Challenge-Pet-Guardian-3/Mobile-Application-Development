// src/screens/Clinics/ClinicsSearchScreen.tsx
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Platform,
  Linking,
  Alert,
  ActivityIndicator,
  useWindowDimensions,
} from 'react-native';
import { MaterialCommunityIcons, Ionicons, FontAwesome } from '@expo/vector-icons';
import { Header } from '../../components/Header';
import { useClinics, ClinicaResponse } from '../../hooks/useClinics';

const showAlert = (title: string, message: string) => {
  if (Platform.OS === 'web') {
    window.alert(`${title}\n${message}`);
  } else {
    Alert.alert(title, message);
  }
};

// Breakpoints simples para adaptar o layout (mobile / tablet-web / desktop-web)
const BREAKPOINT_TABLET = 700;
const BREAKPOINT_DESKTOP = 1100;

export default function ClinicsSearchScreen() {
  const [termoBusca, setTermoBusca] = useState('');
  const [somente24h, setSomente24h] = useState(false);
  const [somenteProntoSocorro, setSomenteProntoSocorro] = useState(false);

  const { data: clinicas, isLoading } = useClinics({ termoBusca, somente24h, somenteProntoSocorro });

  const { width } = useWindowDimensions();
  const isWeb = Platform.OS === 'web';

  // Número de colunas do grid conforme a largura disponível.
  // No app mobile nativo isso praticamente nunca passa de 1 coluna.
  const columns = width >= BREAKPOINT_DESKTOP ? 3 : width >= BREAKPOINT_TABLET ? 2 : 1;
  const cardWidthPercent = columns === 1 ? '100%' : columns === 2 ? '48.5%' : '32%';

  const handleLigar = (telefone: string) => {
    const num = telefone.replace(/\D/g, '');

    if (Platform.OS === 'web') {
      // No navegador não tem como discar de verdade — só mostra o número
      showAlert('Contato', `Telefone da clínica: ${telefone}`);
      return;
    }

    Linking.openURL(`tel:${num}`).catch(() => {
      showAlert('Contato', `Telefone da clínica: ${telefone}`);
    });
  };

  return (
    <View style={styles.container}>
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={{ paddingTop: 10, paddingBottom: 6, width: '100%' }}>
          <Header title="Clínicas Veterinárias" showBack />
        </View>

        {/* Container central que limita a largura em telas grandes (web/desktop) */}
        <View style={[styles.pageInner, isWeb && width >= BREAKPOINT_DESKTOP && styles.pageInnerWide]}>
          <View style={styles.searchWrapper}>
            <Ionicons name="search" size={18} color="#94A3B8" style={{ marginRight: 8 }} />
            <TextInput
              style={styles.searchInput}
              placeholder="Buscar por nome da clínica..."
              placeholderTextColor="#94A3B8"
              value={termoBusca}
              onChangeText={setTermoBusca}
            />
            {termoBusca !== '' && (
              <TouchableOpacity onPress={() => setTermoBusca('')}>
                <Ionicons name="close-circle" size={18} color="#94A3B8" />
              </TouchableOpacity>
            )}
          </View>

          <View style={styles.filtersRow}>
            <TouchableOpacity
              style={[styles.filterChip, somente24h && styles.filterChipActive]}
              onPress={() => setSomente24h(!somente24h)}
              activeOpacity={0.8}
            >
              <MaterialCommunityIcons name="clock-time-four-outline" size={15} color={somente24h ? '#FFFFFF' : '#EF4444'} />
              <Text style={[styles.filterChipText, somente24h && styles.filterChipTextActive]}>Aberto 24 Horas</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.filterChip, somenteProntoSocorro && styles.filterChipActive]}
              onPress={() => setSomenteProntoSocorro(!somenteProntoSocorro)}
              activeOpacity={0.8}
            >
              <MaterialCommunityIcons name="ambulance" size={15} color={somenteProntoSocorro ? '#FFFFFF' : '#0066FF'} />
              <Text style={[styles.filterChipText, somenteProntoSocorro && styles.filterChipTextActive]}>Pronto-Socorro</Text>
            </TouchableOpacity>
          </View>

          {isLoading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#0066FF" />
              <Text style={styles.loadingText}>Localizando clínicas veterinárias...</Text>
            </View>
          ) : (clinicas || []).length === 0 ? (
            <View style={styles.emptyContainer}>
              <MaterialCommunityIcons name="hospital-box-outline" size={44} color="#94A3B8" />
              <Text style={styles.emptyTitle}>Nenhuma clínica encontrada</Text>
              <Text style={styles.emptyText}>Tente alterar os filtros ou o termo de busca.</Text>
            </View>
          ) : (
            <View style={styles.grid}>
              {(clinicas || []).map((clinica: ClinicaResponse) => (
                <View
                  key={clinica.id}
                  style={[
                    styles.clinicCard,
                    clinica.patrocinada && styles.clinicCardSponsored,
                    { width: cardWidthPercent },
                  ]}
                >
                  {clinica.patrocinada && (
                    <View style={styles.sponsoredBadge}>
                      <MaterialCommunityIcons name="crown" size={12} color="#D97706" />
                      <Text style={styles.sponsoredBadgeText}>Parceira Destaque</Text>
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

                    <TouchableOpacity style={styles.btnCall} onPress={() => handleLigar(clinica.telefone)} activeOpacity={0.8}>
                      <Ionicons name="call" size={18} color="#FFFFFF" />
                    </TouchableOpacity>
                  </View>

                  <View style={styles.specialtiesRow}>
                    {clinica.especialidades.map((esp, i) => (
                      <View key={i} style={styles.specialtyChip}>
                        <Text style={styles.specialtyChipText}>{esp}</Text>
                      </View>
                    ))}
                  </View>
                </View>
              ))}
            </View>
          )}
        </View>

        <View style={{ height: 110 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    paddingTop: Platform.select({ ios: 50, android: 30, default: 24 }),
  },
  scrollContent: { paddingHorizontal: 20, alignItems: 'center' },
  // Container central: em mobile ocupa 100%, em telas largas (web) fica limitado e centralizado
  pageInner: { width: '100%', gap: 14 },
  pageInnerWide: { maxWidth: 1100 },
  loadingContainer: { justifyContent: 'center', alignItems: 'center', paddingVertical: 40, gap: 10, width: '100%' },
  loadingText: { fontSize: 14, color: '#64748B', fontWeight: '500' },
  emptyContainer: { alignItems: 'center', paddingVertical: 40, gap: 6, width: '100%' },
  emptyTitle: { fontSize: 15, fontWeight: '700', color: '#334155' },
  emptyText: { fontSize: 13, color: '#64748B', textAlign: 'center' },
  searchWrapper: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFFFFF', borderRadius: 14, paddingHorizontal: 12, height: 46, borderWidth: 1, borderColor: '#E2E8F0' },
  searchInput: { flex: 1, fontSize: 14, color: '#1E293B', outlineStyle: 'none' as any },
  filtersRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 4 },
  filterChip: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFFFFF', paddingVertical: 7, paddingHorizontal: 12, borderRadius: 16, borderWidth: 1, borderColor: 'rgba(226, 232, 240, 0.8)', gap: 6 },
  filterChipActive: { backgroundColor: '#0066FF', borderColor: '#0066FF' },
  filterChipText: { fontSize: 12, fontWeight: '700', color: '#475569' },
  filterChipTextActive: { color: '#FFFFFF' },
  // Grid: em mobile os cards ficam empilhados (100%); em telas largas, viram colunas lado a lado
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 14, width: '100%' },
  clinicCard: { backgroundColor: '#FFFFFF', borderRadius: 22, padding: 16, borderWidth: 1, borderColor: 'rgba(226, 232, 240, 0.8)', elevation: 2 },
  clinicCardSponsored: { borderColor: '#FED7AA', backgroundColor: '#FFFDF9' },
  sponsoredBadge: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FEF3C7', paddingVertical: 3, paddingHorizontal: 8, borderRadius: 8, alignSelf: 'flex-start', gap: 4, marginBottom: 8 },
  sponsoredBadgeText: { fontSize: 10, fontWeight: '800', color: '#B45309' },
  clinicMainRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  clinicInfo: { flex: 1, paddingRight: 10 },
  clinicName: { fontSize: 15, fontWeight: '800', color: '#0F172A' },
  clinicAddress: { fontSize: 12, color: '#64748B', marginTop: 2, marginBottom: 6 },
  ratingRow: { flexDirection: 'row', alignItems: 'center', gap: 6, flexWrap: 'wrap' },
  ratingText: { fontSize: 12, fontWeight: '800', color: '#1E293B' },
  badge24h: { backgroundColor: '#FEF2F2', paddingVertical: 2, paddingHorizontal: 6, borderRadius: 6 },
  badge24hText: { fontSize: 10, fontWeight: '800', color: '#EF4444' },
  badgePS: { backgroundColor: '#EFF6FF', paddingVertical: 2, paddingHorizontal: 6, borderRadius: 6 },
  badgePSText: { fontSize: 10, fontWeight: '800', color: '#0066FF' },
  btnCall: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#10B981',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 2,
    // No web, dá um feedback de "clicável" no hover/cursor
    ...(Platform.OS === 'web' ? ({ cursor: 'pointer' } as any) : {}),
  },
  specialtiesRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 12, borderTopWidth: 1, borderTopColor: '#F1F5F9', paddingTop: 10 },
  specialtyChip: { backgroundColor: '#F8FAFC', paddingVertical: 3, paddingHorizontal: 8, borderRadius: 8, borderWidth: 1, borderColor: '#EDF2F7' },
  specialtyChipText: { fontSize: 10, color: '#64748B', fontWeight: '600' },
});