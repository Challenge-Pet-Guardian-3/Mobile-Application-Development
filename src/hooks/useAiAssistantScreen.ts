import { useState, useMemo, useRef, useEffect, useCallback } from 'react';
import { Keyboard, Platform, ScrollView } from 'react-native';
import { usePets } from './usePets';
import { useSession } from './useSession';
import { useAiChat, useAiInsights } from './useAiAssistant';
import { PetResponse } from '../types/pet';
import { AiMessageInputSchema } from '../utils/schemas';

export const SUGESTOES_RAPIDAS = [
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

  const [selectedPetId, setSelectedPetId] = useState<number | null>(null);
  const [inputText, setInputText] = useState('');
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
    pets,
    activePet,
    selectedPetId,
    setSelectedPetId,
    insights: insights || [],
    isLoadingInsights,
    messages,
    isChatSending,
    inputText,
    setInputText,
    isKeyboardVisible,
    scrollViewRef,
    handleSend,
    sugestoesRapidas: SUGESTOES_RAPIDAS,
  };
}
