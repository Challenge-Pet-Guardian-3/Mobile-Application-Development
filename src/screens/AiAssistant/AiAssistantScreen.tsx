import React, { useState, useMemo, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  KeyboardAvoidingView,
  Keyboard,
  Platform,
} from 'react-native';
import { MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
import { Header } from '../../components/Header';
import { LoadingSpinner } from '../../components/LoadingSpinner';
import { usePets } from '../../hooks/usePets';
import { useAiChat, useAiInsights } from '../../hooks/useAiAssistant';
import { PetResponse } from '../../types/pet';

const SUGESTOES_RAPIDAS = [
  '🦴 Quantidade de ração por porte?',
  '💉 Quais as vacinas obrigatórias?',
  '🏃 Dicas para diminuir ansiedade',
  '🦷 Como escovar os dentes do pet?',
  '🍫 O que é tóxico para cães e gatos?',
  '🛁 Frequência recomendada de banho',
];

export default function AiAssistantScreen() {
  const { data: petsData } = usePets();
  const pets: PetResponse[] = petsData?.content || [];

  const [selectedPetId, setSelectedPetId] = useState<number | null>(null);
  const [isKeyboardVisible, setKeyboardVisible] = useState(false);
  const scrollViewRef = useRef<ScrollView>(null);

  const activePet: PetResponse | undefined = useMemo(() => {
    if (pets.length === 0) return undefined;
    if (selectedPetId) {
      const found = pets.find((p) => p.id === selectedPetId);
      if (found) return found;
    }
    return pets[0];
  }, [pets, selectedPetId]);

  const { data: insights, isLoading: isLoadingInsights } = useAiInsights(activePet);
  const { messages, sendMessage, isLoading: isChatSending } = useAiChat(activePet);

  const [inputText, setInputText] = useState('');

  // Listener para estado do teclado (ajusta padding da barra dinamicamente)
  useEffect(() => {
    const showSub = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow',
      () => setKeyboardVisible(true)
    );
    const hideSub = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide',
      () => setKeyboardVisible(false)
    );

    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, []);

  // Rolar automaticamente para o final do chat ao enviar/receber mensagem
  useEffect(() => {
    const timer = setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }, 120);
    return () => clearTimeout(timer);
  }, [messages, isChatSending]);

  const handleSend = (texto?: string) => {
    const promptToSend = (texto || inputText).trim();
    if (!promptToSend) return;
    sendMessage(promptToSend);
    setInputText('');
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 8 : 0}
    >
      <View style={styles.headerPad}>
        <Header subtitle="Orientação Preventiva & Saúde" />
      </View>

      <ScrollView
        ref={scrollViewRef}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Seletor do Pet para Contexto */}
        {pets.length > 0 && (
          <View style={styles.petContextBar}>
            <Text style={styles.petContextLabel}>Contexto:</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
              {pets.map((pet) => {
                const isSelected = activePet?.id === pet.id;
                return (
                  <TouchableOpacity
                    key={pet.id}
                    style={[
                      styles.petContextChip,
                      isSelected && styles.petContextChipSelected,
                    ]}
                    onPress={() => setSelectedPetId(pet.id)}
                    activeOpacity={0.8}
                  >
                    <Text
                      style={[
                        styles.petContextChipText,
                        isSelected && styles.petContextChipTextSelected,
                      ]}
                    >
                      🐾 {pet.nome}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>
        )}

        {/* Insights Preventivos Automáticos */}
        <View style={styles.insightsSection}>
          <View style={styles.insightsHeader}>
            <MaterialCommunityIcons name="lightbulb-on-outline" size={18} color="#2563EB" />
            <Text style={styles.insightsTitle}>Recomendações Preventivas</Text>
          </View>

          {isLoadingInsights ? (
            <LoadingSpinner message="Analisando histórico..." size="small" />
          ) : (
            (insights || []).map((ins, idx) => (
              <View key={idx} style={styles.insightCard}>
                <Text style={styles.insightCardTitle}>{ins.titulo}</Text>
                <Text style={styles.insightCardDesc}>{ins.descricao}</Text>
              </View>
            ))
          )}
        </View>

        {/* Histórico do Chat */}
        <View style={styles.chatSection}>
          <Text style={styles.chatSectionTitle}>Conversa com a IA</Text>
          {messages.map((msg) => {
            const isUser = msg.sender === 'user';
            return (
              <View
                key={msg.id}
                style={[styles.msgWrapper, isUser ? styles.msgUserWrapper : styles.msgAiWrapper]}
              >
                {!isUser && (
                  <View style={styles.aiAvatar}>
                    <MaterialCommunityIcons name="robot" size={16} color="#2563EB" />
                  </View>
                )}
                <View style={[styles.msgBubble, isUser ? styles.msgBubbleUser : styles.msgBubbleAi]}>
                  <Text style={[styles.msgText, isUser ? styles.msgTextUser : styles.msgTextAi]}>
                    {msg.text}
                  </Text>
                  <Text style={[styles.msgTime, isUser ? styles.msgTimeUser : styles.msgTimeAi]}>
                    {msg.timestamp}
                  </Text>
                </View>
              </View>
            );
          })}
          {isChatSending && (
            <View style={[styles.msgWrapper, styles.msgAiWrapper]}>
              <View style={styles.aiAvatar}>
                <MaterialCommunityIcons name="robot" size={16} color="#2563EB" />
              </View>
              <View style={[styles.msgBubble, styles.msgBubbleAi]}>
                <Text style={styles.msgTextAi}>Consultando inteligência preventiva...</Text>
              </View>
            </View>
          )}
        </View>

        <View style={{ height: 20 }} />
      </ScrollView>

      {/* Painel Fixo Inferior: Sugestões de Perguntas + Barra de Input */}
      <View
        style={[
          styles.fixedBottomContainer,
          {
            paddingBottom: isKeyboardVisible
              ? 14
              : Platform.OS === 'ios'
              ? 104
              : 96,
          },
        ]}
      >
        {/* Carrossel Fixo de Sugestões de Perguntas Rápidas (Estilo Modelos de IA) */}
        <View style={styles.fixedSuggestionsWrapper}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.suggestionsScroll}
            keyboardShouldPersistTaps="handled"
          >
            {SUGESTOES_RAPIDAS.map((sug, i) => (
              <TouchableOpacity
                key={i}
                style={styles.suggestionChip}
                onPress={() => handleSend(sug)}
                activeOpacity={0.75}
              >
                <Ionicons name="sparkles" size={12} color="#2563EB" />
                <Text style={styles.suggestionChipText}>{sug}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Campo de Input Cápsula */}
        <View style={styles.inputInnerWrapper}>
          <TextInput
            style={styles.chatInput}
            placeholder="Escreva sua dúvida para a IA..."
            placeholderTextColor="#94A3B8"
            value={inputText}
            onChangeText={setInputText}
            onSubmitEditing={() => handleSend()}
            returnKeyType="send"
          />
          <TouchableOpacity
            style={[styles.btnSend, !inputText.trim() && { opacity: 0.35 }]}
            onPress={() => handleSend()}
            disabled={!inputText.trim() || isChatSending}
            activeOpacity={0.8}
          >
            <Ionicons name="arrow-up" size={18} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  headerPad: {
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'ios' ? 50 : 25,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 24,
    gap: 16,
  },
  petContextBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  petContextLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#64748B',
  },
  petContextChip: {
    backgroundColor: '#FFFFFF',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(226, 232, 240, 0.8)',
  },
  petContextChipSelected: {
    backgroundColor: '#0F172A',
    borderColor: '#0F172A',
  },
  petContextChipText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#475569',
  },
  petContextChipTextSelected: {
    color: '#FFFFFF',
  },
  insightsSection: {
    backgroundColor: '#FFFFFF',
    borderRadius: 22,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(226, 232, 240, 0.8)',
    gap: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.02,
    shadowRadius: 8,
    elevation: 1,
  },
  insightsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 2,
  },
  insightsTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0F172A',
  },
  insightCard: {
    backgroundColor: '#F8FAFC',
    borderRadius: 14,
    padding: 12,
    borderWidth: 1,
    borderColor: '#EDF2F7',
  },
  insightCardTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#2563EB',
    marginBottom: 2,
  },
  insightCardDesc: {
    fontSize: 12,
    color: '#475569',
    lineHeight: 18,
  },
  chatSection: {
    gap: 10,
    marginTop: 4,
  },
  chatSectionTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 4,
  },
  msgWrapper: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'flex-end',
    marginVertical: 3,
  },
  msgUserWrapper: {
    justifyContent: 'flex-end',
  },
  msgAiWrapper: {
    justifyContent: 'flex-start',
  },
  aiAvatar: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#EFF6FF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  msgBubble: {
    maxWidth: '82%',
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 18,
  },
  msgBubbleUser: {
    backgroundColor: '#0F172A',
    borderBottomRightRadius: 4,
  },
  msgBubbleAi: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: 'rgba(226, 232, 240, 0.8)',
    borderBottomLeftRadius: 4,
  },
  msgText: {
    fontSize: 13,
    lineHeight: 19,
  },
  msgTextUser: {
    color: '#FFFFFF',
  },
  msgTextAi: {
    color: '#1E293B',
  },
  msgTime: {
    fontSize: 10,
    marginTop: 4,
    alignSelf: 'flex-end',
  },
  msgTimeUser: {
    color: 'rgba(255, 255, 255, 0.6)',
  },
  msgTimeAi: {
    color: '#94A3B8',
  },
  fixedBottomContainer: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    gap: 10,
  },
  fixedSuggestionsWrapper: {
    marginBottom: 2,
  },
  suggestionsScroll: {
    gap: 8,
    paddingVertical: 2,
  },
  suggestionChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EFF6FF',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#DBEAFE',
    gap: 6,
  },
  suggestionChipText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#2563EB',
  },
  inputInnerWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 4,
    gap: 8,
  },
  chatInput: {
    flex: 1,
    paddingHorizontal: 8,
    paddingVertical: 8,
    fontSize: 13,
    color: '#1E293B',
  },
  btnSend: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#0F172A',
    justifyContent: 'center',
    alignItems: 'center',
  },
});
