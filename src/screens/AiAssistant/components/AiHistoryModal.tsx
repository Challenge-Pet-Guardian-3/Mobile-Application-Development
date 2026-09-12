import React, { useEffect, useState } from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AiService } from '../../../services/ai';
import { PetResponse } from '../../../types/pet';

interface AuditoriaItem {
  id: number;
  sessionId: string;
  pergunta: string;
  resposta: string;
  categoria: string;
  urgencia: string;
  origemResposta: string;
  timestamp?: string;
}

interface AiHistoryModalProps {
  visible: boolean;
  onClose: () => void;
  pet?: PetResponse;
}

export function AiHistoryModal({ visible, onClose, pet }: AiHistoryModalProps) {
  const [loading, setLoading] = useState(false);
  const [auditorias, setAuditorias] = useState<AuditoriaItem[]>([]);

  useEffect(() => {
    if (visible && pet?.id) {
      setLoading(true);
      AiService.getAuditoriasDoPet(pet.id)
        .then((dados) => setAuditorias(dados))
        .catch(() => setAuditorias([]))
        .finally(() => setLoading(false));
    }
  }, [visible, pet?.id]);

  const getUrgencyBadge = (urgencia: string) => {
    const u = urgencia.toUpperCase();
    if (u === 'EMERGENCIA') {
      return { bg: '#FEE2E2', border: '#FCA5A5', text: '#DC2626', label: 'EMERGÊNCIA' };
    }
    if (u === 'ALTA') {
      return { bg: '#FFEDD5', border: '#FDBA74', text: '#EA580C', label: 'ALTA' };
    }
    if (u === 'MEDIA') {
      return { bg: '#FEF9C3', border: '#FDE047', text: '#CA8A04', label: 'MÉDIA' };
    }
    return { bg: '#DCFCE7', border: '#86EFAC', text: '#16A34A', label: 'PREVENTIVA' };
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContainer}>
          {/* Header do Modal */}
          <View style={styles.modalHeader}>
            <View style={styles.titleRow}>
              <View style={styles.iconCircle}>
                <Ionicons name="server-outline" size={18} color="#2563EB" />
              </View>
              <View>
                <Text style={styles.modalTitle}>Histórico & Auditoria SQLite</Text>
                <Text style={styles.modalSubtitle}>
                  Atendimentos registrados para {pet?.nome || 'seu pet'}
                </Text>
              </View>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn} activeOpacity={0.7}>
              <Ionicons name="close" size={20} color="#64748B" />
            </TouchableOpacity>
          </View>

          {/* Conteúdo do Modal */}
          {loading ? (
            <View style={styles.loadingBox}>
              <ActivityIndicator size="large" color="#2563EB" />
              <Text style={styles.loadingText}>Buscando registros no banco de dados...</Text>
            </View>
          ) : auditorias.length === 0 ? (
            <View style={styles.emptyBox}>
              <Ionicons name="file-tray-outline" size={44} color="#94A3B8" />
              <Text style={styles.emptyTitle}>Nenhum histórico no banco</Text>
              <Text style={styles.emptySubtitle}>
                Faça uma pergunta sobre o {pet?.nome || 'pet'} no chat para registrar o primeiro atendimento no SQLite.
              </Text>
            </View>
          ) : (
            <ScrollView
              style={styles.scrollArea}
              contentContainerStyle={styles.scrollContent}
              showsVerticalScrollIndicator={false}
            >
              {auditorias.map((item) => {
                const badge = getUrgencyBadge(item.urgencia);
                return (
                  <View key={`audit_${item.id}`} style={styles.cardAudit}>
                    <View style={styles.cardTopRow}>
                      <View
                        style={[
                          styles.badgeUrgency,
                          { backgroundColor: badge.bg, borderColor: badge.border },
                        ]}
                      >
                        <Text style={[styles.badgeText, { color: badge.text }]}>
                          {badge.label}
                        </Text>
                      </View>
                      <Text style={styles.cardTimestamp}>
                        {item.timestamp ? item.timestamp.replace('T', ' ').slice(0, 16) : ''}
                      </Text>
                    </View>

                    {/* Pergunta do Tutor */}
                    <View style={styles.bubblePergunta}>
                      <Text style={styles.labelPergunta}>Pergunta do Tutor:</Text>
                      <Text style={styles.textPergunta}>{item.pergunta}</Text>
                    </View>

                    {/* Resposta da IA */}
                    <View style={styles.bubbleResposta}>
                      <Text style={styles.labelResposta}>Parecer Guardian AI:</Text>
                      <Text style={styles.textResposta} numberOfLines={4}>
                        {item.resposta}
                      </Text>
                    </View>

                    <View style={styles.cardFooter}>
                      <Text style={styles.footerOrigem}>
                        Mecanismo: {item.origemResposta}
                      </Text>
                    </View>
                  </View>
                );
              })}
            </ScrollView>
          )}

          {/* Rodapé com Fechar */}
          <View style={styles.modalFooter}>
            <TouchableOpacity onPress={onClose} style={styles.btnFechar} activeOpacity={0.8}>
              <Text style={styles.btnFecharText}>Fechar Histórico</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.6)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '85%',
    minHeight: '50%',
    paddingBottom: 24,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  iconCircle: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: '#EFF6FF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0F172A',
  },
  modalSubtitle: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 1,
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F8FAFC',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingBox: {
    padding: 40,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  loadingText: {
    fontSize: 13,
    color: '#64748B',
  },
  emptyBox: {
    padding: 40,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  emptyTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#334155',
  },
  emptySubtitle: {
    fontSize: 13,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 18,
  },
  scrollArea: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    gap: 14,
  },
  cardAudit: {
    backgroundColor: '#F8FAFC',
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    gap: 10,
  },
  cardTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  badgeUrgency: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    borderWidth: 1,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  cardTimestamp: {
    fontSize: 11,
    color: '#94A3B8',
    fontWeight: '500',
  },
  bubblePergunta: {
    backgroundColor: '#FFFFFF',
    padding: 10,
    borderRadius: 10,
    borderLeftWidth: 3,
    borderLeftColor: '#3B82F6',
  },
  labelPergunta: {
    fontSize: 11,
    fontWeight: '700',
    color: '#2563EB',
    marginBottom: 2,
  },
  textPergunta: {
    fontSize: 13,
    color: '#1E293B',
    lineHeight: 18,
  },
  bubbleResposta: {
    backgroundColor: '#FFFFFF',
    padding: 10,
    borderRadius: 10,
    borderLeftWidth: 3,
    borderLeftColor: '#10B981',
  },
  labelResposta: {
    fontSize: 11,
    fontWeight: '700',
    color: '#059669',
    marginBottom: 2,
  },
  textResposta: {
    fontSize: 13,
    color: '#334155',
    lineHeight: 18,
  },
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 4,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  footerOrigem: {
    fontSize: 11,
    color: '#64748B',
    fontStyle: 'italic',
  },
  modalFooter: {
    paddingHorizontal: 20,
    paddingTop: 12,
  },
  btnFechar: {
    backgroundColor: '#0F172A',
    paddingVertical: 12,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnFecharText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});
