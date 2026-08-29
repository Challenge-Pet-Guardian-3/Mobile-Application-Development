import React, { useState, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Platform,
  Alert,
  Dimensions,
} from 'react-native';
import { MaterialCommunityIcons, Ionicons, FontAwesome5 } from '@expo/vector-icons';
import { Header } from '../../components/Header';
import { PremiumLockCard } from '../../components/PremiumLockCard';
import { TrainingService } from '../../services/trainings';
import { TrainingLesson, TrainingTrack } from '../../types/training';
import { usePets } from '../../hooks/usePets';
import { useSession } from '../../hooks/useSession';

const { width } = Dimensions.get('window');

export default function TrainingEducationScreen() {
  const { user } = useSession();
  const { data: petsData } = usePets();
  const pets = petsData?.content || [];
  const petAtivo = pets[0];

  const [trilhas, setTrilhas] = useState<TrainingTrack[]>([]);
  const [trilhaAtivaIndex, setTrilhaAtivaIndex] = useState(0);
  const [totalXpGanho, setTotalXpGanho] = useState(120);

  const [licaoSelecionada, setLicaoSelecionada] = useState<{
    trilhaId: string;
    licao: TrainingLesson;
  } | null>(null);

  useEffect(() => {
    if (user?.role !== 'COMUM') {
      TrainingService.getTrilhas(petAtivo?.id).then(setTrilhas);
    }
  }, [petAtivo?.id, user?.role]);

  const handleConcluirLicao = useCallback(async () => {
    if (!licaoSelecionada) return;

    try {
      const result = await TrainingService.concluirLicao(
        licaoSelecionada.trilhaId,
        licaoSelecionada.licao.id
      );

      const atualizadas = await TrainingService.getTrilhas(petAtivo?.id);
      setTrilhas(atualizadas);
      setTotalXpGanho((prev) => prev + result.pontosGanhos);
      setLicaoSelecionada(null);

      Alert.alert(
        '🏆 PARABÉNS!',
        `Lição concluída! Você ganhou +${result.pontosGanhos} XP direcionados para o nível de ${petAtivo?.nome || 'seu Pet'}!`
      );
    } catch (e) {
      Alert.alert('Erro', 'Não foi possível registrar a lição.');
    }
  }, [licaoSelecionada, petAtivo]);

  // Se o usuário for Comum, exibe mensagem clara e amigável sobre o recurso Premium
  if (user?.role === 'COMUM') {
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

  const trilhaAtual = trilhas[trilhaAtivaIndex] || trilhas[0];

  // Cálculo de progresso da trilha
  const totalLicoes = trilhaAtual?.licoes?.length || 1;
  const licoesConcluidas = trilhaAtual?.licoes?.filter((l) => l.concluido).length || 0;
  const progressoPercent = Math.round((licoesConcluidas / totalLicoes) * 100);

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={{ paddingBottom: 130 }} showsVerticalScrollIndicator={false}>
        <View style={styles.headerPad}>
          <Header title="Trilhas & Treinamento" />
        </View>

        {/* Duolingo Gamification Top Bar */}
        <View style={styles.duoTopBar}>
          <View style={styles.duoStatItem}>
            <MaterialCommunityIcons name="fire" size={24} color="#FF9600" />
            <Text style={styles.duoStatVal}>5 Dias</Text>
          </View>

          <View style={styles.duoStatItem}>
            <MaterialCommunityIcons name="diamond" size={22} color="#1CB0F6" />
            <Text style={[styles.duoStatVal, { color: '#0284C7' }]}>{totalXpGanho} XP</Text>
          </View>

          <View style={styles.duoStatItem}>
            <MaterialCommunityIcons name="crown" size={22} color="#FFC800" />
            <Text style={[styles.duoStatVal, { color: '#B45309' }]}>Nível {Math.floor(totalXpGanho / 50) + 1}</Text>
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
                <View style={[styles.duoProgressFill, { width: `${progressoPercent}%` }]} />
              </View>
              <Text style={styles.duoProgressText}>{progressoPercent}% Completo</Text>
            </View>
          </View>

          <View style={styles.duoBannerMascot}>
            <FontAwesome5 name="graduation-cap" size={38} color="#FFF" />
          </View>
        </View>

        {/* Seletor de Trilhas (Pills) */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.trackPillsScroll}>
          {trilhas.map((t, idx) => (
            <TouchableOpacity
              key={t.id}
              style={[styles.trackPill, trilhaAtivaIndex === idx && { backgroundColor: t.cor, borderColor: t.cor }]}
              onPress={() => setTrilhaAtivaIndex(idx)}
            >
              <Text style={[styles.trackPillText, trilhaAtivaIndex === idx && styles.trackPillTextActive]}>
                {t.titulo}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Trilha Visual com Nós / Trail Estilo Duolingo */}
        <View style={styles.trailContainer}>
          {trilhaAtual?.licoes?.map((licao, index) => {
            // Padrão em zigue-zague estilo caminho do Duolingo
            const offsets = [0, 45, -45, 30, -30];
            const currentOffset = offsets[index % offsets.length];

            return (
              <View
                key={licao.id}
                style={[
                  styles.nodeWrapper,
                  { transform: [{ translateX: currentOffset }] },
                ]}
              >
                {/* Linha conectora entre lições */}
                {index > 0 && <View style={styles.nodeConnector} />}

                <TouchableOpacity
                  style={[
                    styles.nodeButton,
                    licao.concluido
                      ? styles.nodeButtonDone
                      : { backgroundColor: trilhaAtual.cor, borderBottomColor: '#46A302' },
                  ]}
                  onPress={() => setLicaoSelecionada({ trilhaId: trilhaAtual.id, licao })}
                  activeOpacity={0.75}
                >
                  <View style={styles.nodeInnerCircle}>
                    {licao.concluido ? (
                      <Ionicons name="checkmark-sharp" size={32} color="#FFF" />
                    ) : (
                      <FontAwesome5 name="paw" size={24} color="#FFF" />
                    )}
                  </View>
                </TouchableOpacity>

                {/* Badge Flutuante de Informação do Nó */}
                <View style={styles.nodeLabelBox}>
                  <Text style={styles.nodeLabelTitle}>{licao.titulo}</Text>
                  <Text style={styles.nodeLabelXp}>+{licao.pontos} XP</Text>
                </View>
              </View>
            );
          })}
        </View>
      </ScrollView>

      {/* Modal de Lição Interativa Duolingo */}
      {licaoSelecionada && (
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.modalTopRow}>
              <View style={styles.duoBadgeXP}>
                <MaterialCommunityIcons name="star" size={16} color="#FF9600" />
                <Text style={styles.duoBadgeXPText}>+{licaoSelecionada.licao.pontos} PONTOS XP</Text>
              </View>
              <TouchableOpacity onPress={() => setLicaoSelecionada(null)} style={{ padding: 4 }}>
                <Ionicons name="close-circle" size={28} color="#94A3B8" />
              </TouchableOpacity>
            </View>

            <Text style={styles.modalTitle}>{licaoSelecionada.licao.titulo}</Text>
            <Text style={styles.modalDesc}>{licaoSelecionada.licao.descricao}</Text>

            <Text style={styles.passosHeader}>Passo a Passo Prático com o Pet:</Text>

            <ScrollView style={{ maxHeight: 220 }} showsVerticalScrollIndicator={false}>
              {licaoSelecionada.licao.passos.map((passo, idx) => (
                <View key={idx} style={styles.passoCard}>
                  <View style={[styles.passoCircle, { backgroundColor: trilhaAtual.cor }]}>
                    <Text style={styles.passoNumber}>{idx + 1}</Text>
                  </View>
                  <Text style={styles.passoText}>{passo}</Text>
                </View>
              ))}
            </ScrollView>

            <TouchableOpacity
              style={[styles.btnCompletarDuo, { backgroundColor: trilhaAtual.cor }]}
              onPress={handleConcluirLicao}
              activeOpacity={0.8}
            >
              <Ionicons name="checkmark-done" size={22} color="#FFF" style={{ marginRight: 8 }} />
              <Text style={styles.btnCompletarDuoText}>Concluir & Ganhar Pontos!</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
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
  trailContainer: { alignItems: 'center', paddingVertical: 10, gap: 34 },
  nodeWrapper: { alignItems: 'center' },
  nodeConnector: {
    position: 'absolute',
    top: -34,
    width: 6,
    height: 34,
    backgroundColor: '#CBD5E1',
    zIndex: -1,
  },
  nodeButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    borderBottomWidth: 6,
    elevation: 6,
  },
  nodeButtonDone: {
    backgroundColor: '#FFC800',
    borderBottomColor: '#D97706',
  },
  nodeInnerCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    borderWidth: 3,
    borderColor: 'rgba(255,255,255,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  nodeLabelBox: {
    backgroundColor: '#FFF',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 12,
    marginTop: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    alignItems: 'center',
    elevation: 2,
  },
  nodeLabelTitle: { fontSize: 12, fontWeight: '800', color: '#1E293B' },
  nodeLabelXp: { fontSize: 11, fontWeight: 'bold', color: '#58CC02', marginTop: 1 },
  modalOverlay: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(15, 23, 42, 0.65)',
    justifyContent: 'center',
    padding: 20,
    zIndex: 999,
  },
  modalCard: { backgroundColor: '#FFF', borderRadius: 26, padding: 22, elevation: 12 },
  modalTopRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  duoBadgeXP: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF7ED',
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 10,
    gap: 4,
  },
  duoBadgeXPText: { fontSize: 11, fontWeight: '900', color: '#D97706' },
  modalTitle: { fontSize: 20, fontWeight: '900', color: '#0F172A', marginBottom: 4 },
  modalDesc: { fontSize: 13, color: '#64748B', lineHeight: 18, marginBottom: 14 },
  passosHeader: { fontSize: 14, fontWeight: 'bold', color: '#1E293B', marginBottom: 10 },
  passoCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#F8FAFC',
    padding: 12,
    borderRadius: 14,
    marginBottom: 8,
    gap: 10,
  },
  passoCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 2,
  },
  passoNumber: { fontSize: 11, fontWeight: 'bold', color: '#FFF' },
  passoText: { flex: 1, fontSize: 13, color: '#334155', lineHeight: 19 },
  btnCompletarDuo: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 16,
    borderRadius: 18,
    marginTop: 16,
    borderBottomWidth: 4,
    borderBottomColor: 'rgba(0,0,0,0.15)',
  },
  btnCompletarDuoText: { color: '#FFF', fontWeight: '900', fontSize: 16 },
});
