import { useState, useCallback, useEffect } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { AiService } from '../services/ai';
import { queryKeys } from '../lib/queryKeys';
import { AiMessage } from '../types/ai';
import { PetResponse } from '../types/pet';

export function useAiInsights(pet?: PetResponse | null) {
  return useQuery({
    queryKey: queryKeys.ai.insights(pet?.id),
    queryFn: () => AiService.getInsightsDoPet(pet),
    enabled: !!pet,
  });
}

export function useAiChat(pet?: PetResponse | null) {
  const [messages, setMessages] = useState<AiMessage[]>([]);

  useEffect(() => {
    setMessages([
      {
        id: `welcome_${pet?.id || 'generic'}`,
        sender: 'assistant',
        text: `Olá! Sou a Guardian AI. Como posso ajudar com os cuidados de ${pet ? pet.nome : 'seu pet'} hoje?`,
        timestamp: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
      },
    ]);
  }, [pet?.id, pet?.nome]);

  const sendMutation = useMutation({
    mutationFn: (variables: { text: string; historico: AiMessage[] }) =>
      AiService.enviarMensagem(variables.text, pet, variables.historico),
    onSuccess: (response) => {
      setMessages((prev) => [...prev, response]);
    },
    onError: () => {
      setMessages((prev) => [
        ...prev,
        {
          id: `err_${Date.now()}`,
          sender: 'assistant',
          text: 'Não foi possível se comunicar com o assistente de IA. Verifique se o microserviço Python da IA está em execução e tente novamente.',
          timestamp: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    },
  });

  const sendMessage = useCallback(
    (text: string) => {
      const trimmed = text.trim();
      if (!trimmed) return;

      const userMsg: AiMessage = {
        id: `user_${Date.now()}`,
        sender: 'user',
        text: trimmed,
        timestamp: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => {
        const next = [...prev, userMsg];
        // Envia as mensagens anteriores como contexto multi-turnos
        sendMutation.mutate({ text: trimmed, historico: prev });
        return next;
      });
    },
    [sendMutation]
  );

  return {
    messages,
    sendMessage,
    isLoading: sendMutation.isPending,
  };
}
