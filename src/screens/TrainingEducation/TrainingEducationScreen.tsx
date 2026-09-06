import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Platform,
  Dimensions,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { MaterialCommunityIcons, Ionicons, FontAwesome5 } from '@expo/vector-icons';
import { Header } from '../../components/Header';
import { LoadingSpinner } from '../../components/LoadingSpinner';
import { PremiumLockCard } from '../../components/PremiumLockCard';
import { TrainingTrail } from '../../components/TrainingTrail';
import { LessonDetailModal } from '../../components/LessonDetailModal';
import { useTrainings } from '../../hooks/useTrainings';

export default function TrainingEducationScreen() {
  const { status, pet, trail, actions } = useTrainings();
  const { petAtivo } = pet;
  const { trilhaAtual } = trail;

  // Se o usuário for Comum, exibe mensagem clara e amigável sobre o recurso Premium
  if (status.isUserComum) {
    return (
      <View style={styles.container}>
        <View style={styles.headerPad}>
          <Header title="Trilhas & Treinamento" />
        </View>
        <PremiumLockCard
          title="Trilhas de Adestramento Premium ⭐"
          description="As trilhas gamificadas de adestramento, lições interativas e ganho de XP acelerado são exclusivas para assinantes Premium."
          benefits={[
            'Módulos educativos completos com IA',
            'Lições práticas e acompanhamento de XP',
            'Assistente inteligente ilimitado',
          ]}
          iconName="crown"
        />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={{ paddingBottom: 130 }}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={status.isFetching && !status.isLoadingTrilhas}
            onRefresh={actions.refetch}
            tintColor="#58CC02"
          />
        }
      >
        <View style={styles.headerPad}>
          <Header title="Trilhas & Treinamento" />
        </View>

        {/* Seletor de Pets da Família */}
        {pet.pets.length > 0 && (
          <View style={styles.petSelectorBox}>
            <Text style={styles.petSelectorLabel}>Pet em Treinamento:</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.petSelectorScroll}>
              {pet.pets.map((p, idx) => {
                const isSelected = p.id === petAtivo?.id;
                return (
                  <TouchableOpacity
                    key={p.id}
                    style={[styles.petChip, isSelected && styles.petChipActive]}
                    onPress={() => pet.setSelectedPetIndex(idx)}
                    activeOpacity={0.8}
                  >
                    <Ionicons
                      name="paw"
                      size={15}
                      color={isSelected ? '#FFFFFF' : '#64748B'}
                    />
                    <Text style={[styles.petChipText, isSelected && styles.petChipTextActive]}>
                      {p.nome}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>
        )}

        {status.isLoadingTrilhas ? (
          <View style={{ paddingVertical: 40 }}>
            <LoadingSpinner message="Buscando trilhas do pet..." size="small" />
          </View>
        ) : trail.trilhas.length === 0 ? (
          /* Empty State Amigável quando o pet não possui trilhas cadastradas */
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
        ) : (
          <>
            {/* Duolingo Gamification Top Bar */}
            <View style={styles.duoTopBar}>
              <View style={styles.duoStatItem}>
                <MaterialCommunityIcons name="fire" size={24} color="#FF9600" />
                <Text style={styles.duoStatVal}>
                  {trail.licoesConcluidas} {trail.licoesConcluidas === 1 ? 'Lição' : 'Lições'}
                </Text>
              </View>

              <View style={styles.duoStatItem}>
                <MaterialCommunityIcons name="diamond" size={22} color="#1CB0F6" />
                <Text style={[styles.duoStatVal, { color: '#0284C7' }]}>{pet.totalXpGanho} XP</Text>
              </View>

              <View style={styles.duoStatItem}>
                <MaterialCommunityIcons name="trophy-outline" size={22} color="#FFC800" />
                <Text style={[styles.duoStatVal, { color: '#B45309' }]}>Trilha Ativa</Text>
              </View>
            </View>

            {/* Banner Duolingo da Trilha */}
            <View style={[styles.duoBanner, { backgroundColor: trilhaAtual?.cor || '#58CC02' }]}>
              <View style={styles.duoBannerContent}>
                <Text style={styles.duoBannerTag}>SEÇÃO ATUAL • {trilhaAtual?.categoria?.toUpperCase()}</Text>
                <Text style={styles.duoBannerTitle}>{trilhaAtual?.titulo}</Text>
                <Text style={styles.duoBannerDesc}>{trilhaAtual?.descricao}</Text>

                {/* Barra de Progresso Duolingo */}
                <View style={styles.duoProgressWrapper}>
                  <View style={styles.duoProgressBar}>
                    <View style={[styles.duoProgressFill, { width: `${trail.progressoPercent}%` }]} />
                  </View>
                  <Text style={styles.duoProgressText}>{trail.progressoPercent}% Completo</Text>
                </View>
              </View>

              <View style={styles.duoBannerMascot}>
                <FontAwesome5 name="graduation-cap" size={38} color="#FFF" />
              </View>
            </View>

            {/* Seletor de Trilhas (Pills) */}
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.trackPillsScroll}>
              {trail.trilhas.map((t, idx) => (
                <TouchableOpacity
                  key={t.id}
                  style={[styles.trackPill, trail.trilhaAtivaIndex === idx && { backgroundColor: t.cor, borderColor: t.cor }]}
                  onPress={() => trail.setTrilhaAtivaIndex(idx)}
                >
                  <Text style={[styles.trackPillText, trail.trilhaAtivaIndex === idx && styles.trackPillTextActive]}>
                    {t.titulo}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            {/* Trilha Visual com Nós / Trail Estilo Duolingo */}
            <TrainingTrail
              licoes={trilhaAtual?.licoes}
              corTrilha={trilhaAtual?.cor}
              onSelectLicao={(licao) => trail.setLicaoSelecionada({ trilhaId: trilhaAtual.id, licao })}
            />
          </>
        )}
      </ScrollView>

      {/* Modal de Lição Interativa Duolingo */}
      <LessonDetailModal
        visible={!!trail.licaoSelecionada}
        licao={trail.licaoSelecionada?.licao ?? null}
        corTrilha={trilhaAtual?.cor}
        isConcluindo={status.isConcluindo}
        onClose={() => trail.setLicaoSelecionada(null)}
        onConcluir={actions.concluirLicao}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  headerPad: { paddingHorizontal: 20, paddingTop: Platform.OS === 'ios' ? 50 : 25 },
  duoTopBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#FFF',
    marginHorizontal: 20,
    marginTop: 10,
    marginBottom: 16,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    elevation: 2,
  },
  duoStatItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  duoStatVal: { fontSize: 14, fontWeight: '900', color: '#1E293B' },
  duoBanner: {
    marginHorizontal: 20,
    borderRadius: 24,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    elevation: 4,
    borderBottomWidth: 4,
    borderBottomColor: 'rgba(0,0,0,0.15)',
  },
  duoBannerContent: { flex: 1, paddingRight: 10 },
  duoBannerTag: { fontSize: 11, fontWeight: '900', color: 'rgba(255,255,255,0.85)', letterSpacing: 0.5 },
  duoBannerTitle: { fontSize: 20, fontWeight: '900', color: '#FFF', marginTop: 2, marginBottom: 4 },
  duoBannerDesc: { fontSize: 12, color: 'rgba(255,255,255,0.9)', lineHeight: 17, marginBottom: 12 },
  duoBannerMascot: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(255,255,255,0.25)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  duoProgressWrapper: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  duoProgressBar: { flex: 1, height: 10, backgroundColor: 'rgba(255,255,255,0.3)', borderRadius: 5, overflow: 'hidden' },
  duoProgressFill: { height: '100%', backgroundColor: '#FFF', borderRadius: 5 },
  duoProgressText: { fontSize: 11, fontWeight: 'bold', color: '#FFF' },
  trackPillsScroll: { paddingHorizontal: 20, gap: 10, marginBottom: 20 },
  trackPill: {
    backgroundColor: '#FFF',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
  },
  trackPillText: { fontSize: 13, fontWeight: '700', color: '#475569' },
  trackPillTextActive: { color: '#FFF', fontWeight: '900' },
  petSelectorBox: {
    marginHorizontal: 20,
    marginBottom: 16,
  },
  petSelectorLabel: {
    fontSize: 12,
    fontWeight: '800',
    color: '#64748B',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  petSelectorScroll: {
    gap: 8,
  },
  petChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#FFF',
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
  },
  petChipActive: {
    backgroundColor: '#2563EB',
    borderColor: '#2563EB',
  },
  petChipText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#475569',
  },
  petChipTextActive: {
    color: '#FFF',
    fontWeight: '900',
  },
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
