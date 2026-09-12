import React, { useEffect, useState, useCallback } from 'react';
import { Modal, View, Text, StyleSheet, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AiService } from '../../../services/ai';
import { PetResponse } from '../../../types/pet';
import { AiChatSession, AiMessage } from '../../../types/ai';

interface AiHistoryModalProps {
  visible: boolean;
  onClose: () => void;
  pet?: PetResponse;
  activeSessionId?: string;
  onSelectSession: (sessionId: string, mensagens: AiMessage[]) => void;
  onNewChat: () => void;
}

export function AiHistoryModal({
  visible,
  onClose,
  pet,
  activeSessionId,
  onSelectSession,
  onNewChat,
}: AiHistoryModalProps) {
  const [loading, setLoading] = useState(false);
  const [loadingSessionId, setLoadingSessionId] = useState<string | null>(null);
  const [sessoes, setSessoes] = useState<AiChatSession[]>([]);

  const carregarSessoes = useCallback(async () => {
    if (!pet?.id) return;
    setLoading(true);
    try {
      const dados = await AiService.getSessoesDoPet(pet.id);
      setSessoes(dados);
    } catch {
      setSessoes([]);
    } finally {
      setLoading(false);
    }
  }, [pet?.id]);

  useEffect(() => {
    if (visible && pet?.id) {
      carregarSessoes();
    }
  }, [visible, pet?.id, carregarSessoes]);

  const handleSelectSession = async (sessao: AiChatSession) => {
    setLoadingSessionId(sessao.sessionId);
    try {
      const mensagens = await AiService.getMensagensDaSessao(sessao.sessionId);
      onSelectSession(sessao.sessionId, mensagens);
      onClose();
    } catch {
      // Falha de carregamento silenciosa
    } finally {
      setLoadingSessionId(null);
    }
  };

  const handleDeleteSession = async (sessionIdParaExcluir: string) => {
    // Exclusão direta no SQLite sem alerta bloqueante (conforme preferência do usuário)
    setSessoes((prev) => prev.filter((s) => s.sessionId !== sessionIdParaExcluir));
    await AiService.excluirSessao(sessionIdParaExcluir);

    if (sessionIdParaExcluir === activeSessionId) {
      onNewChat();
    }
  };

  const handleStartNewChat = () => {
    onNewChat();
    onClose();
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
                <Ionicons name="chatbubbles-outline" size={18} color="#2563EB" />
              </View>
              <View>
                <Text style={styles.modalTitle}>Histórico de Conversas</Text>
                <Text style={styles.modalSubtitle}>
                  Conversas salvas de {pet?.nome || 'seu pet'}
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
              <Text style={styles.loadingText}>Buscando conversas no banco de dados...</Text>
            </View>
          ) : sessoes.length === 0 ? (
            <View style={styles.emptyBox}>
              <Ionicons name="chatbubble-ellipses-outline" size={44} color="#94A3B8" />
              <Text style={styles.emptyTitle}>Nenhuma conversa anterior</Text>
              <Text style={styles.emptySubtitle}>
                Envie uma dúvida sobre o {pet?.nome || 'pet'} no chat para que suas conversas fiquem registradas aqui.
              </Text>
            </View>
          ) : (
            <ScrollView
              style={styles.scrollArea}
              contentContainerStyle={styles.scrollContent}
              showsVerticalScrollIndicator={false}
            >
              {sessoes.map((item) => {
                const isActive = item.sessionId === activeSessionId;
                const isLoadingThis = loadingSessionId === item.sessionId;

                return (
                  <View
                    key={`sessao_${item.sessionId}`}
                    style={[styles.cardSession, isActive && styles.cardSessionActive]}
                  >
                    <TouchableOpacity
                      style={styles.cardMainClickable}
                      onPress={() => handleSelectSession(item)}
                      disabled={isLoadingThis}
                      activeOpacity={0.7}
                    >
                      <View
                        style={[
                          styles.sessionIconCircle,
                          isActive && styles.sessionIconCircleActive,
                        ]}
                      >
                        <Ionicons
                          name={isActive ? 'chatbubble' : 'chatbubble-outline'}
                          size={16}
                          color={isActive ? '#2563EB' : '#64748B'}
                        />
                      </View>

                      <View style={styles.sessionTextCol}>
                        <View style={styles.sessionTitleRow}>
                          <Text
                            style={[styles.sessionTitle, isActive && styles.sessionTitleActive]}
                            numberOfLines={1}
                          >
                            {item.titulo || 'Conversa sem título'}
                          </Text>
                          {isActive && (
                            <View style={styles.badgeAtiva}>
                              <Text style={styles.badgeAtivaText}>Ativa</Text>
                            </View>
                          )}
                        </View>

                        <View style={styles.sessionMetaRow}>
                          <Text style={styles.sessionTimestamp}>
                            {item.lastActivity
                              ? item.lastActivity.replace('T', ' ').slice(0, 16)
                              : 'Recente'}
                          </Text>
                          <Text style={styles.sessionMetaDot}>•</Text>
                          <Text style={styles.sessionCountText}>
                            {item.totalMensagens} {item.totalMensagens === 1 ? 'msg' : 'msgs'}
                          </Text>
                        </View>
                      </View>
                    </TouchableOpacity>

                    {/* Ações da Sessão: Loading ou Lixeira */}
                    <View style={styles.cardActions}>
                      {isLoadingThis ? (
                        <ActivityIndicator size="small" color="#2563EB" />
                      ) : (
                        <TouchableOpacity
                          onPress={() => handleDeleteSession(item.sessionId)}
                          style={styles.btnDeleteSession}
                          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                          activeOpacity={0.6}
                        >
                          <Ionicons name="trash-outline" size={17} color="#94A3B8" />
                        </TouchableOpacity>
                      )}
                    </View>
                  </View>
                );
              })}
            </ScrollView>
          )}

          {/* Rodapé com botão de Nova Conversa e Fechar */}
          <View style={styles.modalFooter}>
            <TouchableOpacity
              onPress={handleStartNewChat}
              style={styles.btnNovaConversa}
              activeOpacity={0.8}
            >
              <Ionicons name="add-circle-outline" size={18} color="#2563EB" />
              <Text style={styles.btnNovaConversaText}>Nova Conversa</Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={onClose} style={styles.btnFechar} activeOpacity={0.8}>
              <Text style={styles.btnFecharText}>Fechar</Text>
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
    padding: 16,
    gap: 10,
  },
  cardSession: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: 16,
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    justifyContent: 'space-between',
  },
  cardSessionActive: {
    backgroundColor: '#EFF6FF',
    borderColor: '#BFDBFE',
  },
  cardMainClickable: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingRight: 8,
  },
  sessionIconCircle: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sessionIconCircleActive: {
    backgroundColor: '#DBEAFE',
    borderColor: '#93C5FD',
  },
  sessionTextCol: {
    flex: 1,
    gap: 3,
  },
  sessionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 6,
  },
  sessionTitle: {
    flex: 1,
    fontSize: 13,
    fontWeight: '700',
    color: '#1E293B',
  },
  sessionTitleActive: {
    color: '#1D4ED8',
  },
  badgeAtiva: {
    backgroundColor: '#DBEAFE',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  badgeAtivaText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#2563EB',
  },
  sessionMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  sessionTimestamp: {
    fontSize: 11,
    color: '#94A3B8',
    fontWeight: '500',
  },
  sessionMetaDot: {
    fontSize: 11,
    color: '#CBD5E1',
  },
  sessionCountText: {
    fontSize: 11,
    color: '#64748B',
    fontWeight: '600',
  },
  cardActions: {
    paddingLeft: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnDeleteSession: {
    padding: 6,
    borderRadius: 8,
  },
  modalFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 16,
    paddingTop: 12,
  },
  btnNovaConversa: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: '#EFF6FF',
    borderWidth: 1,
    borderColor: '#BFDBFE',
    paddingVertical: 12,
    borderRadius: 14,
  },
  btnNovaConversaText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#2563EB',
  },
  btnFechar: {
    flex: 1,
    backgroundColor: '#0F172A',
    paddingVertical: 12,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnFecharText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});
