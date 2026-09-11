import React from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { PremiumLockCard } from '../../components/PremiumLockCard';
import { useAiAssistantScreen } from '../../hooks/useAiAssistantScreen';
import { AppTabParamList } from '../../routes/types';
import { AiHeader } from './components/AiHeader';
import { AiPetContextSelector } from './components/AiPetContextSelector';
import { AiPreventiveInsights } from './components/AiPreventiveInsights';
import { AiChatMessages } from './components/AiChatMessages';
import { AiChatInputBar } from './components/AiChatInputBar';

export default function AiAssistantScreen() {
  const navigation = useNavigation<BottomTabNavigationProp<AppTabParamList>>();
  const insets = useSafeAreaInsets();
  const { isUserComum, pet, insights, chat } = useAiAssistantScreen();

  const handleGoBack = () => navigation.navigate('Home');

  if (isUserComum) {
    return (
      <View style={styles.container}>
        <AiHeader onGoBack={handleGoBack} />
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
      <AiHeader
        onGoBack={handleGoBack}
        onClearChat={chat.clearChat}
        hasMessages={chat.messages.length > 0}
      />

      <ScrollView
        ref={chat.scrollViewRef}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Seletor do Pet para Contexto */}
        <AiPetContextSelector pet={pet} />

        {/* Insights Preventivos Automáticos */}
        <AiPreventiveInsights insights={insights} />

        {/* Histórico do Chat */}
        <AiChatMessages chat={chat} />

        <View style={{ height: 20 }} />
      </ScrollView>

      {/* Painel Fixo Inferior: Sugestões de Perguntas + Barra de Input */}
      <AiChatInputBar chat={chat} insets={insets} />
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 24,
    gap: 16,
  },
});
