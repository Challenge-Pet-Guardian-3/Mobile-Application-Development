import { useState, useRef, useEffect, useCallback } from 'react';
import { Keyboard, Platform, ScrollView } from 'react-native';
import { usePets } from './usePets';
import { useSession } from './useSession';
import { useActivePet } from './useActivePet';
import { useAiChat, useAiInsights, useAiWarmup } from './useAiAssistant';
import { PetResponse } from '../types/pet';
import { AiMessageInputSchema } from '../utils/schemas';

const SUGESTOES_RAPIDAS = [
  '🦴 Quantidade de ração por porte?',
  '💉 Quais as vacinas obrigatórias?',
  '🏃 Dicas para diminuir ansiedade',
  '🦷 Como escovar os dentes do pet?',
  '🍫 O que é tóxico para cães e gatos?',
  '🛁 Frequência recomendada de banho',
];

export function useAiAssistantScreen() {
  const { user } = useSession();
  const { data: petsData } = usePets();
  const pets: PetResponse[] = petsData?.content || [];

  const { activePet, selectedPetId, setSelectedPetId } = useActivePet(pets);
  const [inputText, setInputText] = useState('');
  const [isKeyboardVisible, setKeyboardVisible] = useState(false);
  const scrollViewRef = useRef<ScrollView>(null);

  // Executa warm-up silencioso em background via hook dedicado
  useAiWarmup();

  const { data: insights, isLoading: isLoadingInsights } = useAiInsights(activePet);
  const { messages, sessionId, sendMessage, carregarSessao, clearChat, isLoading: isChatSending } = useAiChat(activePet);

  // Monitora visibilidade do teclado para ajuste de padding
  useEffect(() => {
    const showEvent = Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow';
    const hideEvent = Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide';

    const showSub = Keyboard.addListener(showEvent, () => setKeyboardVisible(true));
    const hideSub = Keyboard.addListener(hideEvent, () => setKeyboardVisible(false));

    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, []);

  // Rola automaticamente para o fim da conversa quando chegam novas mensagens
  useEffect(() => {
    const timer = setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }, 120);
    return () => clearTimeout(timer);
  }, [messages, isChatSending]);

  const handleSend = useCallback(
    (texto?: string) => {
      const validacao = AiMessageInputSchema.safeParse(texto || inputText);
      if (!validacao.success) return;

      sendMessage(validacao.data);
      setInputText('');
    },
    [inputText, sendMessage]
  );

  return {
    user,
    isUserComum: user?.role === 'COMUM',
    pet: {
      pets,
      activePet,
      selectedPetId,
      setSelectedPetId,
    },
    insights: {
      data: insights || [],
      isLoading: isLoadingInsights,
    },
    chat: {
      messages,
      sessionId,
      isSending: isChatSending,
      inputText,
      setInputText,
      handleSend,
      carregarSessao,
      clearChat,
      sugestoesRapidas: SUGESTOES_RAPIDAS,
      scrollViewRef,
      isKeyboardVisible,
    },
  };
}
