import { useState, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import { AiService } from '../services/ai';
import { queryKeys } from '../lib/queryKeys';
import { AiMessage } from '../types/ai';
import { PetResponse } from '../types/pet';

export function useAiInsights(pet?: PetResponse | null) {
  return useQuery({
    queryKey: pet?.id ? queryKeys.ai.insights(pet.id) : ['ai', 'insights', 'generic'],
    queryFn: () => AiService.getInsightsDoPet(pet),
  });
}

export function useAiChat(pet?: PetResponse | null) {
  const [messages, setMessages] = useState<AiMessage[]>([
    {
      id: 'welcome_1',
      sender: 'assistant',
      text: `Olá! Sou a Guardian AI. Como posso ajudar com os cuidados de ${pet ? pet.nome : 'seu pet'} hoje?`,
      timestamp: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
    },
  ]);
  const [isLoading, setIsLoading] = useState(false);

  const sendMessage = useCallback(
    async (text: string) => {
      if (!text.trim()) return;

      const userMsg: AiMessage = {
        id: `user_${Date.now()}`,
        sender: 'user',
        text: text.trim(),
        timestamp: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, userMsg]);
      setIsLoading(true);

      try {
        const response = await AiService.enviarMensagem(text, pet);
        setMessages((prev) => [...prev, response]);
      } catch (e) {
        setMessages((prev) => [
          ...prev,
          {
            id: `err_${Date.now()}`,
            sender: 'assistant',
            text: 'Não foi possível se comunicar com o assistente de IA. Verifique se o microserviço Python da IA está em execução e tente novamente.',
            timestamp: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
          },
        ]);
      } finally {
        setIsLoading(false);
      }
    },
    [pet]
  );

  return {
    messages,
    sendMessage,
    isLoading,
  };
}
