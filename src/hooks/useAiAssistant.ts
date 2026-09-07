import { useState, useCallback, useEffect } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { AiService } from '../services/ai';
import { queryKeys } from '../lib/queryKeys';
import { AiMessage } from '../types/ai';
import { PetResponse } from '../types/pet';

export function useAiWarmup() {
  useEffect(() => {
    AiService.ping();
  }, []);
}

export function useAiInsights(pet?: PetResponse) {
  return useQuery({
    queryKey: queryKeys.ai.insights(pet?.id),
    queryFn: () => AiService.getInsightsDoPet(pet),
    enabled: !!pet,
  });
}

export function useAiChat(pet?: PetResponse) {
  const [messages, setMessages] = useState<AiMessage[]>([]);

  // Inicia o chat limpo
  useEffect(() => {
    setMessages([]);
  }, [pet?.id]);

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
          text: '⚠️ Não foi possível se comunicar com os servidores da Guardian AI no momento. Isso pode ocorrer por oscilações temporárias de conexão ou inicialização do serviço em nuvem. Por favor, tente enviar sua mensagem novamente em instantes.',
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
