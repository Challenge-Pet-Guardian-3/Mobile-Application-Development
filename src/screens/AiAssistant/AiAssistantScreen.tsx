import React from 'react';
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
  ActivityIndicator,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
import { Header } from '../../components/Header';
import { LoadingSpinner } from '../../components/LoadingSpinner';
import { PremiumLockCard } from '../../components/PremiumLockCard';
import { shadows } from '../../utils/shadow';
import { useAiAssistantScreen } from '../../hooks/useAiAssistantScreen';
import { AppTabParamList } from '../../routes/types';

export default function AiAssistantScreen() {
  const navigation = useNavigation<BottomTabNavigationProp<AppTabParamList>>();
  const insets = useSafeAreaInsets();
  const { user, isUserComum, pet, insights, chat } = useAiAssistantScreen();

  if (isUserComum) {
    return (
      <View style={styles.container}>
        <View style={styles.headerPad}>
          <TouchableOpacity
            onPress={() => navigation.navigate('Home')}
            style={styles.btnVoltarTop}
            activeOpacity={0.7}
          >
            <Ionicons name="arrow-back" size={16} color="#1E293B" />
            <Text style={styles.btnVoltarText}>Voltar para o Início</Text>
          </TouchableOpacity>
          <Header subtitle="Orientação Preventiva & Saúde" />
        </View>
        <PremiumLockCard
          title="Assistente IA Exclusivo Premium ⭐"
          description="A IA Preventiva de Saúde com insights personalizados e orientações especializadas de saúde e bem-estar para seus pets está disponível exclusivamente para assinantes Premium."
          benefits={[
            'Insights automáticos de saúde preventiva',
            'Dúvidas sobre dosagens, nutrição e vacinas',
            'Orientações contextuais por animal',
          ]}
          iconName="robot"
        />
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 8 : 0}
    >
      <View style={styles.headerPad}>
        <TouchableOpacity
          onPress={() => navigation.navigate('Home')}
          style={styles.btnVoltarTop}
          activeOpacity={0.7}
        >
          <Ionicons name="arrow-back" size={16} color="#1E293B" />
          <Text style={styles.btnVoltarText}>Voltar para o Início</Text>
        </TouchableOpacity>
        <Header subtitle="Orientação Preventiva & Saúde" />
      </View>

      <ScrollView
        ref={chat.scrollViewRef}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Seletor do Pet para Contexto */}
        {pet.pets.length > 0 && (
          <View style={styles.petContextBar}>
            <Text style={styles.petContextLabel}>Contexto:</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
              {pet.pets.map((p) => {
                const isSelected = pet.activePet?.id === p.id;
                return (
                  <TouchableOpacity
                    key={p.id}
                    style={[
                      styles.petContextChip,
                      isSelected && styles.petContextChipSelected,
                    ]}
                    onPress={() => pet.setSelectedPetId(p.id)}
                    activeOpacity={0.8}
                  >
                    <Text
                      style={[
                        styles.petContextChipText,
                        isSelected && styles.petContextChipTextSelected,
                      ]}
                    >
                      🐾 {p.nome}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>
        )}

        {/* Insights Preventivos Automáticos (Renderizados se disponíveis) */}
        {(insights.isLoading || insights.data.length > 0) && (
          <View style={styles.insightsSection}>
            <View style={styles.insightsHeader}>
              <MaterialCommunityIcons name="lightbulb-on-outline" size={18} color="#2563EB" />
              <Text style={styles.insightsTitle}>Recomendações Preventivas</Text>
            </View>

            {insights.isLoading ? (
              <LoadingSpinner message="Analisando histórico..." size="small" />
            ) : (
              insights.data.map((ins, idx) => (
                <View key={idx} style={styles.insightCard}>
                  <Text style={styles.insightCardTitle}>{ins.titulo}</Text>
                  <Text style={styles.insightCardDesc}>{ins.descricao}</Text>
                </View>
              ))
            )}
          </View>
        )}

        {/* Histórico do Chat */}
        <View style={styles.chatSection}>
          <Text style={styles.chatSectionTitle}>Conversa com a IA</Text>

          {chat.messages.length === 0 && !chat.isSending && (
            <View style={styles.emptyChatWrapper}>
              <View style={styles.emptyChatIconBg}>
                <MaterialCommunityIcons name="chat-processing-outline" size={28} color="#2563EB" />
              </View>
              <Text style={styles.emptyChatTitle}>Como a Guardian AI pode ajudar hoje?</Text>
              <Text style={styles.emptyChatDesc}>
                Envie perguntas sobre alimentação, vacinas, primeiros socorros ou rotina de cuidados do seu pet.
              </Text>
            </View>
          )}

          {chat.messages.map((msg) => {
            const isUser = msg.sender === 'user';
            const isError = msg.id.startsWith('err_') || msg.id.startsWith('ai_err_');
            return (
              <View
                key={msg.id}
                style={[styles.msgWrapper, isUser ? styles.msgUserWrapper : styles.msgAiWrapper]}
              >
                {!isUser && (
                  <View style={[styles.aiAvatar, isError && styles.aiAvatarError]}>
                    <MaterialCommunityIcons
                      name={isError ? 'alert-circle-outline' : 'robot'}
                      size={16}
                      color={isError ? '#DC2626' : '#2563EB'}
                    />
                  </View>
                )}
                <View
                  style={[
                    styles.msgBubble,
                    isUser ? styles.msgBubbleUser : styles.msgBubbleAi,
                    isError && styles.msgBubbleError,
                  ]}
                >
                  <Text
                    style={[
                      styles.msgText,
                      isUser ? styles.msgTextUser : styles.msgTextAi,
                      isError && styles.msgTextError,
                    ]}
                  >
                    {msg.text}
                  </Text>
                  <Text style={[styles.msgTime, isUser ? styles.msgTimeUser : styles.msgTimeAi]}>
                    {msg.timestamp}
                  </Text>
                </View>
              </View>
            );
          })}
          {chat.isSending && (
            <View style={[styles.msgWrapper, styles.msgAiWrapper]}>
              <View style={styles.aiAvatar}>
                <MaterialCommunityIcons name="robot" size={16} color="#2563EB" />
              </View>
              <View style={[styles.msgBubble, styles.msgBubbleAi, styles.sendingBubble]}>
                <ActivityIndicator size="small" color="#2563EB" style={{ marginRight: 8 }} />
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
            paddingBottom: chat.isKeyboardVisible
              ? (Platform.OS === 'ios' ? 20 : 36)
              : Math.max(insets.bottom + 14, Platform.OS === 'ios' ? 32 : 24),
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
            {chat.sugestoesRapidas.map((sug: string, i: number) => (
              <TouchableOpacity
                key={i}
                style={styles.suggestionChip}
                onPress={() => chat.handleSend(sug)}
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
            value={chat.inputText}
            onChangeText={chat.setInputText}
            onSubmitEditing={() => chat.handleSend()}
            returnKeyType="send"
          />
          <TouchableOpacity
            style={[styles.btnSend, !chat.inputText.trim() && { opacity: 0.35 }]}
            onPress={() => chat.handleSend()}
            disabled={!chat.inputText.trim() || chat.isSending}
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
  btnVoltarTop: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: 6,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 8,
  },
  btnVoltarText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1E293B',
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
    ...shadows.xs,
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
  sendingBubble: {
    flexDirection: 'row',
    alignItems: 'center',
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
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    gap: 12,
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
    paddingVertical: 7,
    paddingHorizontal: 14,
    borderRadius: 16,
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
    borderRadius: 24,
    paddingHorizontal: 16,
    paddingVertical: 6,
    minHeight: 54,
    gap: 10,
  },
  chatInput: {
    flex: 1,
    paddingHorizontal: 6,
    paddingVertical: 10,
    fontSize: 14,
    color: '#1E293B',
    minHeight: 42,
  },
  btnSend: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#0F172A',
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyChatWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 28,
    paddingHorizontal: 20,
    backgroundColor: '#F8FAFC',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    gap: 8,
    marginVertical: 8,
  },
  emptyChatIconBg: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: '#EFF6FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 4,
  },
  emptyChatTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#1E293B',
    textAlign: 'center',
  },
  emptyChatDesc: {
    fontSize: 12,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 18,
    maxWidth: 280,
  },
  aiAvatarError: {
    backgroundColor: '#FEF2F2',
  },
  msgBubbleError: {
    backgroundColor: '#FEF2F2',
    borderColor: '#FECACA',
  },
  msgTextError: {
    color: '#991B1B',
  },
});
