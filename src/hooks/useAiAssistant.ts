// src/hooks/useAiAssistant.ts
import { useState, useCallback } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { api } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { PetBackend } from './usePets';

export interface AiInsight {
  titulo: string;
  descricao: string;
}

export interface AiMessage {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  timestamp: string;
}

export function useAiInsights(pet?: PetBackend) {
  return useQuery<AiInsight[]>({
    queryKey: ['ia-insights', pet?.id],
    queryFn: async () => {
      const { data } = await api.get<AiInsight[]>(`/ia/insights/${pet?.id}`);
      return data;
    },
    enabled: Boolean(pet?.id),
  });
}

export function useAiChat(pet?: PetBackend) {
  const { userData } = useAuth();
  const [messages, setMessages] = useState<AiMessage[]>([]);

  const chatMutation = useMutation({
    mutationFn: async (pergunta: string) => {
      const { data } = await api.post<{ resposta: string }>('/ia/chat', {
        usuarioId: userData?.id,
        petId: pet?.id,
        pergunta,
      });
      return data.resposta;
    },
  });

  const sendMessage = useCallback(
    async (texto: string) => {
      const mensagemUsuario: AiMessage = {
        id: `u-${Date.now()}`,
        sender: 'user',
        text: texto,
        timestamp: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, mensagemUsuario]);

      try {
        const resposta = await chatMutation.mutateAsync(texto);
        const mensagemIa: AiMessage = {
          id: `a-${Date.now()}`,
          sender: 'ai',
          text: resposta,
          timestamp: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
        };
        setMessages((prev) => [...prev, mensagemIa]);
      } catch {
        const mensagemErro: AiMessage = {
          id: `a-erro-${Date.now()}`,
          sender: 'ai',
          text: 'Não consegui responder agora. Tente novamente em instantes.',
          timestamp: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
        };
        setMessages((prev) => [...prev, mensagemErro]);
      }
    },
    [chatMutation]
  );

  return { messages, sendMessage, isLoading: chatMutation.isPending };
}