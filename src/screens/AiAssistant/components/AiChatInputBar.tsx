import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { EdgeInsets } from 'react-native-safe-area-context';
import { useAiAssistantScreen } from '../../../hooks/useAiAssistantScreen';

interface AiChatInputBarProps {
  chat: ReturnType<typeof useAiAssistantScreen>['chat'];
  insets: EdgeInsets;
}

export function AiChatInputBar({ chat, insets }: AiChatInputBarProps) {
  const isSendDisabled = !chat.inputText.trim() || chat.isSending;

  return (
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
      {/* Carrossel Fixo de Sugestões de Perguntas Rápidas */}
      <View style={styles.fixedSuggestionsWrapper}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.suggestionsScroll}
          keyboardShouldPersistTaps="handled"
        >
          {(chat?.sugestoesRapidas ?? []).map((sug: string, i: number) => (
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
          disabled={isSendDisabled}
          activeOpacity={0.8}
        >
          <Ionicons name="arrow-up" size={18} color="#FFFFFF" />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
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
});
