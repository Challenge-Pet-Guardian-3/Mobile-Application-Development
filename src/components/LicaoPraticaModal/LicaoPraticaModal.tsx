import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  Modal, 
  TouchableOpacity, 
  ScrollView 
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

export type ReacaoPet = 'excelente' | 'medo' | 'agitado' | 'desinteresse';

type IconeMaterial = React.ComponentProps<typeof MaterialCommunityIcons>['name'];

interface LicaoModalProps {
  visible: boolean;
  onClose: () => void;
  onConcluir: (xpGanho: number) => void;
  titulo: string;
  icone: IconeMaterial;
  passoAPasso: string[];
  dicasCorrecao: {
    medo: string;
    agitado: string;
    desinteresse: string;
    excelente: string;
  };
  xp: number;
  ehRevisao?: boolean; // Trava anti-trapaça
}

export function LicaoPraticaModal({
  visible,
  onClose,
  onConcluir,
  titulo,
  icone,
  passoAPasso,
  dicasCorrecao,
  xp,
  ehRevisao = false
}: LicaoModalProps) {
  const [etapaFluxo, setEtapaFluxo] = useState<'tutorial' | 'pergunta' | 'feedback'>('tutorial');
  const [reacaoEscolhida, setReacaoEscolhida] = useState<ReacaoPet | null>(null);

  const resetarEFechar = () => {
    setEtapaFluxo('tutorial');
    setReacaoEscolhida(null);
    onClose();
  };

  const handleFinalizar = () => {
    // Se for revisão, repassa 0 XP
    onConcluir(ehRevisao ? 0 : xp);
    resetarEFechar();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={resetarEFechar}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalCard}>
          
          {/* Cabeçalho */}
          <View style={styles.header}>
            <View style={[styles.iconCircle, ehRevisao && { backgroundColor: '#EFF6FF', borderColor: '#BFDBFE' }]}>
              <MaterialCommunityIcons 
                name={icone} 
                size={28} 
                color={ehRevisao ? '#0066FF' : '#58CC02'} 
              />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[styles.badgeTop, ehRevisao && { color: '#0066FF' }]}>
                {ehRevisao ? 'REVISÃO DE TREINO' : 'TREINAMENTO COOPERATIVO'}
              </Text>
              <Text style={styles.tituloHeader}>{titulo}</Text>
            </View>
            <TouchableOpacity onPress={resetarEFechar} style={styles.btnClose}>
              <MaterialCommunityIcons name="close" size={20} color="#64748B" />
            </TouchableOpacity>
          </View>

          {/* FASE 1: TUTORIAL E PASSO A PASSO */}
          {etapaFluxo === 'tutorial' && (
            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.contentScroll}>
              <Text style={styles.secaoTitulo}>Como Praticar com o Pet:</Text>
              
              {passoAPasso.map((passo, idx) => (
                <View key={idx} style={styles.passoRow}>
                  <View style={[styles.passoNumero, ehRevisao && { backgroundColor: '#0066FF' }]}>
                    <Text style={styles.passoNumeroTexto}>{idx + 1}</Text>
                  </View>
                  <Text style={styles.passoTexto}>{passo}</Text>
                </View>
              ))}

              <View style={styles.avisoRegra}>
                <MaterialCommunityIcons name="information" size={20} color="#0066FF" />
                <Text style={styles.avisoRegraTexto}>
                  {ehRevisao 
                    ? 'Você já dominou esta lição! Repetir treinos fortalece a memória do pet, mas não gera novos pontos.'
                    : 'Sessões curtas de 3 a 5 minutos são mais eficazes do que treinos longos e cansativos.'}
                </Text>
              </View>

              <TouchableOpacity 
                style={[styles.btnPrincipal, ehRevisao && { backgroundColor: '#0066FF', borderColor: '#004ECC' }]} 
                onPress={() => setEtapaFluxo('pergunta')}
                activeOpacity={0.8}
              >
                <Text style={styles.btnPrincipalTexto}>
                  {ehRevisao ? 'Refiz a Prática com o Pet' : 'Fiz a Prática com o Pet'}
                </Text>
              </TouchableOpacity>
            </ScrollView>
          )}

          {/* FASE 2: CHECK DE REAÇÃO COMPORTAMENTAL */}
          {etapaFluxo === 'pergunta' && (
            <View style={styles.contentContainer}>
              <Text style={styles.secaoTitulo}>Como o pet reagiu desta vez?</Text>
              <Text style={styles.secaoSub}>
                Selecione com sinceridade para ver as orientações:
              </Text>

              <View style={styles.reacoesGrid}>
                <TouchableOpacity 
                  style={[styles.opcaoCard, reacaoEscolhida === 'excelente' && styles.opcaoCardAtiva]}
                  onPress={() => { setReacaoEscolhida('excelente'); setEtapaFluxo('feedback'); }}
                >
                  <MaterialCommunityIcons name="emoticon-happy-outline" size={26} color="#10B981" />
                  <View style={{ flex: 1 }}>
                    <Text style={styles.opcaoTitulo}>Ficou calmo e focado</Text>
                    <Text style={styles.opcaoDesc}>Compreendeu o estímulo e aceitou a recompensa.</Text>
                  </View>
                </TouchableOpacity>

                <TouchableOpacity 
                  style={[styles.opcaoCard, reacaoEscolhida === 'medo' && styles.opcaoCardAtiva]}
                  onPress={() => { setReacaoEscolhida('medo'); setEtapaFluxo('feedback'); }}
                >
                  <MaterialCommunityIcons name="emoticon-frown-outline" size={26} color="#F59E0B" />
                  <View style={{ flex: 1 }}>
                    <Text style={styles.opcaoTitulo}>Ficou com receio ou recuou</Text>
                    <Text style={styles.opcaoDesc}>Demonstrou hesitação ou se afastou.</Text>
                  </View>
                </TouchableOpacity>

                <TouchableOpacity 
                  style={[styles.opcaoCard, reacaoEscolhida === 'agitado' && styles.opcaoCardAtiva]}
                  onPress={() => { setReacaoEscolhida('agitado'); setEtapaFluxo('feedback'); }}
                >
                  <MaterialCommunityIcons name="fire" size={26} color="#EF4444" />
                  <View style={{ flex: 1 }}>
                    <Text style={styles.opcaoTitulo}>Ficou super agitado / Mordeu</Text>
                    <Text style={styles.opcaoDesc}>Ficou eufórico demais, latindo ou pulando.</Text>
                  </View>
                </TouchableOpacity>

                <TouchableOpacity 
                  style={[styles.opcaoCard, reacaoEscolhida === 'desinteresse' && styles.opcaoCardAtiva]}
                  onPress={() => { setReacaoEscolhida('desinteresse'); setEtapaFluxo('feedback'); }}
                >
                  <MaterialCommunityIcons name="sleep" size={26} color="#64748B" />
                  <View style={{ flex: 1 }}>
                    <Text style={styles.opcaoTitulo}>Ignorou / Sem interesse</Text>
                    <Text style={styles.opcaoDesc}>Não demonstrou curiosidade pelo exercício.</Text>
                  </View>
                </TouchableOpacity>
              </View>
            </View>
          )}

          {/* FASE 3: FEEDBACK E CONCLUSÃO */}
          {etapaFluxo === 'feedback' && reacaoEscolhida && (
            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.contentScroll}>
              <View style={[
                styles.feedbackBox, 
                reacaoEscolhida === 'excelente' ? styles.feedbackSucesso : styles.feedbackAlerta
              ]}>
                <MaterialCommunityIcons 
                  name={reacaoEscolhida === 'excelente' ? 'check-decagram' : 'lightbulb-on-outline'} 
                  size={30} 
                  color={reacaoEscolhida === 'excelente' ? '#10B981' : '#D97706'} 
                />
                <Text style={styles.feedbackTitulo}>
                  {reacaoEscolhida === 'excelente' ? 'Ótima resposta do pet!' : 'Dica de Ajuste:'}
                </Text>
                <Text style={styles.feedbackTexto}>
                  {dicasCorrecao[reacaoEscolhida]}
                </Text>
              </View>

              {/* Box de XP com trava de revisão */}
              <View style={styles.xpBox}>
                <MaterialCommunityIcons 
                  name={ehRevisao ? 'history' : 'trophy'} 
                  size={22} 
                  color={ehRevisao ? '#64748B' : '#F59E0B'} 
                />
                <Text style={[styles.xpBoxTexto, ehRevisao && { color: '#64748B' }]}>
                  {ehRevisao 
                    ? '+0 XP (Modo Revisão • Sem acúmulo duplo)'
                    : `+${xp} XP concedidos pelo cuidado com a matilha!`}
                </Text>
              </View>

              <TouchableOpacity 
                style={[styles.btnPrincipal, ehRevisao && { backgroundColor: '#0066FF', borderColor: '#004ECC' }]} 
                onPress={handleFinalizar}
                activeOpacity={0.8}
              >
                <Text style={styles.btnPrincipalTexto}>
                  {ehRevisao ? 'Finalizar Revisão' : 'Concluir Etapa'}
                </Text>
              </TouchableOpacity>
            </ScrollView>
          )}

        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.65)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalCard: {
    width: '100%',
    maxWidth: 440,
    maxHeight: '85%',
    backgroundColor: '#FFF',
    borderRadius: 24,
    padding: 22,
    elevation: 10,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderColor: '#F1F5F9',
    marginBottom: 16,
  },
  iconCircle: {
    width: 48,
    height: 48,
    borderRadius: 16,
    backgroundColor: '#F0FDF4',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#DCFCE7',
  },
  badgeTop: {
    fontSize: 10,
    fontWeight: '900',
    color: '#58CC02',
    letterSpacing: 0.6,
  },
  tituloHeader: {
    fontSize: 16,
    fontWeight: '800',
    color: '#1E293B',
  },
  btnClose: {
    padding: 6,
    borderRadius: 12,
    backgroundColor: '#F8FAFC',
  },
  contentScroll: {
    gap: 14,
    paddingBottom: 8,
  },
  contentContainer: {
    gap: 12,
  },
  secaoTitulo: {
    fontSize: 16,
    fontWeight: '800',
    color: '#1E293B',
  },
  secaoSub: {
    fontSize: 13,
    color: '#64748B',
    marginBottom: 4,
  },
  passoRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    backgroundColor: '#F8FAFC',
    padding: 12,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  passoNumero: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#58CC02',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 2,
  },
  passoNumeroTexto: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
  passoTexto: {
    flex: 1,
    fontSize: 13,
    color: '#334155',
    lineHeight: 20,
    fontWeight: '500',
  },
  avisoRegra: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: '#EFF6FF',
    padding: 12,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#DBEAFE',
  },
  avisoRegraTexto: {
    flex: 1,
    fontSize: 12,
    color: '#1E40AF',
    fontWeight: '600',
    lineHeight: 18,
  },
  reacoesGrid: {
    gap: 10,
    marginTop: 4,
  },
  opcaoCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 12,
    borderRadius: 16,
    backgroundColor: '#F8FAFC',
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
  },
  opcaoCardAtiva: {
    borderColor: '#58CC02',
    backgroundColor: '#F0FDF4',
  },
  opcaoTitulo: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1E293B',
  },
  opcaoDesc: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
  },
  feedbackBox: {
    padding: 16,
    borderRadius: 18,
    borderWidth: 1.5,
    alignItems: 'center',
    gap: 8,
  },
  feedbackSucesso: {
    backgroundColor: '#F0FDF4',
    borderColor: '#86EFAC',
  },
  feedbackAlerta: {
    backgroundColor: '#FFFBEB',
    borderColor: '#FDE68A',
  },
  feedbackTitulo: {
    fontSize: 15,
    fontWeight: '800',
    color: '#1E293B',
  },
  feedbackTexto: {
    fontSize: 13,
    color: '#475569',
    textAlign: 'center',
    lineHeight: 20,
  },
  xpBox: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#F8FAFC',
    padding: 12,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  xpBoxTexto: {
    fontSize: 13,
    fontWeight: '700',
    color: '#D97706',
  },
  btnPrincipal: {
    backgroundColor: '#58CC02',
    paddingVertical: 14,
    borderRadius: 16,
    alignItems: 'center',
    borderBottomWidth: 4,
    borderColor: '#46A302',
    marginTop: 4,
  },
  btnPrincipalTexto: {
    color: '#FFF',
    fontSize: 15,
    fontWeight: '900',
  },
});