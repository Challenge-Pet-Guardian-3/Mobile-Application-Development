import React from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useAiAssistantScreen } from '../../../hooks/useAiAssistantScreen';

interface AiChatMessagesProps {
  chat: ReturnType<typeof useAiAssistantScreen>['chat'];
}

export function AiChatMessages({ chat }: AiChatMessagesProps) {
  const hasMessages = (chat?.messages?.length ?? 0) > 0;

  return (
    <View style={styles.chatSection}>
      <Text style={styles.chatSectionTitle}>Conversa com a IA</Text>

      {!hasMessages && !chat?.isSending && (
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

      {chat?.messages?.map((msg) => {
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

      {chat?.isSending && (
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
  );
}

const styles = StyleSheet.create({
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
  aiAvatarError: {
    backgroundColor: '#FEF2F2',
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
  msgBubbleError: {
    backgroundColor: '#FEF2F2',
    borderColor: '#FECACA',
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
  msgTextError: {
    color: '#991B1B',
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
});
