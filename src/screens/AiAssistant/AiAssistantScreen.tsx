// src/screens/AiAssistant/AiAssistantScreen.tsx
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
  useWindowDimensions,
} from 'react-native';
import { MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
import { Header } from '../../components/Header';
import { usePets } from '../../hooks/usePets';
import { useAiChat, useAiInsights } from '../../hooks/useAiAssistant';
import { PetBackend } from '../../hooks/usePets';

const SUGESTOES_RAPIDAS = [
  '🦴 Quantidade de ração por porte?',
  '💉 Quais as vacinas obrigatórias?',
  '🏃 Dicas para diminuir ansiedade',
  '🦷 Como escovar os dentes do pet?',
  '🍫 O que é tóxico para cães e gatos?',
  '🛁 Frequência recomendada de banho',
];

// Acima disso, em vez de empilhar tudo, mostramos contexto/insights numa coluna
// fixa ao lado do chat — melhor aproveitamento de tela grande (web/tablet).
const BREAKPOINT_WIDE = 900;

export default function AiAssistantScreen() {
  const { pets } = usePets();
  const [selectedPetId, setSelectedPetId] = useState<number | null>(null);
  const [isKeyboardVisible, setKeyboardVisible] = useState(false);
  const scrollViewRef = useRef<ScrollView>(null);

  const { width } = useWindowDimensions();
  const isWide = width >= BREAKPOINT_WIDE;
  const isWeb = Platform.OS === 'web';

  const activePet: PetBackend | undefined = useMemo(() => {
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

  const petContextBar = pets.length > 0 && (
    <View style={styles.petContextBar}>
      <Text style={styles.petContextLabel}>Contexto:</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
        {pets.map((pet) => {
          const isSelected = activePet?.id === pet.id;
          return (
            <TouchableOpacity
              key={pet.id}
              style={[styles.petContextChip, isSelected && styles.petContextChipSelected]}
              onPress={() => setSelectedPetId(pet.id!)}
              activeOpacity={0.8}
            >
              <Text style={[styles.petContextChipText, isSelected && styles.petContextChipTextSelected]}>
                🐾 {pet.nome}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );

  const insightsSection = (
    <View style={styles.insightsSection}>
      <View style={styles.insightsHeader}>
        <MaterialCommunityIcons name="lightbulb-on-outline" size={18} color="#0066FF" />
        <Text style={styles.insightsTitle}>Recomendações Preventivas</Text>
      </View>

      {isLoadingInsights ? (
        <Text style={styles.loadingText}>Analisando histórico...</Text>
      ) : (insights || []).length === 0 ? (
        <Text style={styles.loadingText}>Nenhuma recomendação disponível no momento.</Text>
      ) : (
        (insights || []).map((ins, idx) => (
          <View key={idx} style={styles.insightCard}>
            <Text style={styles.insightCardTitle}>{ins.titulo}</Text>
            <Text style={styles.insightCardDesc}>{ins.descricao}</Text>
          </View>
        ))
      )}
    </View>
  );

  const chatSection = (
    <View style={styles.chatSection}>
      <Text style={styles.chatSectionTitle}>Conversa com a IA</Text>
      {messages.map((msg) => {
        const isUser = msg.sender === 'user';
        return (
          <View key={msg.id} style={[styles.msgWrapper, isUser ? styles.msgUserWrapper : styles.msgAiWrapper]}>
            {!isUser && (
              <View style={styles.aiAvatar}>
                <MaterialCommunityIcons name="robot" size={16} color="#0066FF" />
              </View>
            )}
            <View style={[styles.msgBubble, isUser ? styles.msgBubbleUser : styles.msgBubbleAi, isWide && styles.msgBubbleWide]}>
              <Text style={[styles.msgText, isUser ? styles.msgTextUser : styles.msgTextAi]}>{msg.text}</Text>
              <Text style={[styles.msgTime, isUser ? styles.msgTimeUser : styles.msgTimeAi]}>{msg.timestamp}</Text>
            </View>
          </View>
        );
      })}
      {isChatSending && (
        <View style={[styles.msgWrapper, styles.msgAiWrapper]}>
          <View style={styles.aiAvatar}>
            <MaterialCommunityIcons name="robot" size={16} color="#0066FF" />
          </View>
          <View style={[styles.msgBubble, styles.msgBubbleAi]}>
            <Text style={styles.msgTextAi}>Consultando inteligência preventiva...</Text>
          </View>
        </View>
      )}
    </View>
  );

  const bottomInput = (
    <View
      style={[
        styles.fixedBottomContainer,
        { paddingBottom: isKeyboardVisible ? 14 : Platform.select({ ios: 104, android: 96, default: 20 }) },
      ]}
    >
      <View style={styles.fixedSuggestionsWrapper}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.suggestionsScroll}
          keyboardShouldPersistTaps="handled"
        >
          {SUGESTOES_RAPIDAS.map((sug, i) => (
            <TouchableOpacity key={i} style={styles.suggestionChip} onPress={() => handleSend(sug)} activeOpacity={0.75}>
              <Ionicons name="sparkles" size={12} color="#0066FF" />
              <Text style={styles.suggestionChipText}>{sug}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

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
  );

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 8 : 0}
    >
      <View style={styles.headerPad}>
        <Header title="Orientação Preventiva & Saúde" showBack />
      </View>

      {/* Layout largo (web/tablet): contexto + recomendações fixos numa coluna lateral,
          chat ocupa o espaço restante. Layout estreito (celular): tudo empilhado e rolável. */}
      <View style={[styles.body, isWide && styles.bodyWide]}>
        {isWide && (
          <ScrollView style={styles.sidebar} showsVerticalScrollIndicator={false} contentContainerStyle={{ gap: 16 }}>
            {petContextBar}
            {insightsSection}
          </ScrollView>
        )}

        <View style={styles.chatColumn}>
          <ScrollView
            ref={scrollViewRef}
            style={{ flex: 1 }}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            {!isWide && petContextBar}
            {!isWide && insightsSection}
            {chatSection}
            <View style={{ height: 20 }} />
          </ScrollView>

          {bottomInput}
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  headerPad: { paddingHorizontal: 20, paddingTop: Platform.select({ ios: 50, android: 25, default: 20 }) },

  // `body` é quem decide se a tela vira duas colunas (web largo) ou uma coluna (mobile)
  body: { flex: 1, width: '100%' },
  bodyWide: {
    flexDirection: 'row',
    maxWidth: 1100,
    width: '100%',
    alignSelf: 'center',
    gap: 20,
    paddingHorizontal: 20,
  },

  sidebar: { width: 320, flexShrink: 0 },
  // minWidth: 0 evita que o conteúdo do chat "estoure" a largura da coluna no react-native-web
  chatColumn: { flex: 1, minWidth: 0 },

  scrollContent: { paddingHorizontal: 20, paddingTop: 8, gap: 16 },
  petContextBar: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  petContextLabel: { fontSize: 12, fontWeight: '700', color: '#64748B' },
  petContextChip: { backgroundColor: '#FFFFFF', paddingVertical: 6, paddingHorizontal: 12, borderRadius: 14, borderWidth: 1, borderColor: 'rgba(226, 232, 240, 0.8)' },
  petContextChipSelected: { backgroundColor: '#0066FF', borderColor: '#0066FF' },
  petContextChipText: { fontSize: 12, fontWeight: '700', color: '#475569' },
  petContextChipTextSelected: { color: '#FFFFFF' },
  insightsSection: { backgroundColor: '#FFFFFF', borderRadius: 22, padding: 16, borderWidth: 1, borderColor: 'rgba(226, 232, 240, 0.8)', gap: 10, elevation: 1 },
  insightsHeader: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 2 },
  insightsTitle: { fontSize: 14, fontWeight: '800', color: '#0F172A' },
  loadingText: { fontSize: 12, color: '#94A3B8' },
  insightCard: { backgroundColor: '#F8FAFC', borderRadius: 14, padding: 12, borderWidth: 1, borderColor: '#EDF2F7' },
  insightCardTitle: { fontSize: 13, fontWeight: '800', color: '#0066FF', marginBottom: 2 },
  insightCardDesc: { fontSize: 12, color: '#475569', lineHeight: 18 },
  chatSection: { gap: 10, marginTop: 4 },
  chatSectionTitle: { fontSize: 15, fontWeight: '800', color: '#0F172A', marginBottom: 4 },
  msgWrapper: { flexDirection: 'row', gap: 8, alignItems: 'flex-end', marginVertical: 3 },
  msgUserWrapper: { justifyContent: 'flex-end' },
  msgAiWrapper: { justifyContent: 'flex-start' },
  aiAvatar: { width: 30, height: 30, borderRadius: 15, backgroundColor: '#EFF6FF', justifyContent: 'center', alignItems: 'center' },
  msgBubble: { maxWidth: '82%', paddingVertical: 12, paddingHorizontal: 14, borderRadius: 18 },
  // Em telas largas, "82%" da coluna de chat ainda fica confortável (a coluna já é limitada),
  // mas travamos um teto absoluto para não formar balões enormes de texto.
  msgBubbleWide: { maxWidth: 520 },
  msgBubbleUser: { backgroundColor: '#0066FF', borderBottomRightRadius: 4 },
  msgBubbleAi: { backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: 'rgba(226, 232, 240, 0.8)', borderBottomLeftRadius: 4 },
  msgText: { fontSize: 13, lineHeight: 19 },
  msgTextUser: { color: '#FFFFFF' },
  msgTextAi: { color: '#1E293B' },
  msgTime: { fontSize: 10, marginTop: 4, alignSelf: 'flex-end' },
  msgTimeUser: { color: 'rgba(255, 255, 255, 0.6)' },
  msgTimeAi: { color: '#94A3B8' },
  fixedBottomContainer: { backgroundColor: '#FFFFFF', paddingHorizontal: 16, paddingTop: 10, borderTopWidth: 1, borderTopColor: '#F1F5F9', gap: 10 },
  fixedSuggestionsWrapper: { marginBottom: 2 },
  suggestionsScroll: { gap: 8, paddingVertical: 2 },
  suggestionChip: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#EFF6FF', paddingVertical: 6, paddingHorizontal: 12, borderRadius: 14, borderWidth: 1, borderColor: '#DBEAFE', gap: 6 },
  suggestionChipText: { fontSize: 12, fontWeight: '700', color: '#0066FF' },
  inputInnerWrapper: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F8FAFC', borderWidth: 1, borderColor: '#E2E8F0', borderRadius: 20, paddingHorizontal: 12, paddingVertical: 4, gap: 8 },
  chatInput: { flex: 1, paddingHorizontal: 8, paddingVertical: 8, fontSize: 13, color: '#1E293B', outlineStyle: 'none' as any },
  btnSend: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#0066FF',
    justifyContent: 'center',
    alignItems: 'center',
    ...(Platform.OS === 'web' ? ({ cursor: 'pointer' } as any) : {}),
  },
});