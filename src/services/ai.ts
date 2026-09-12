import axios from 'axios';
import { env } from '../config/env';
import { AiMessage, AiPetInsight, AiChatResponsePayload, AiPetContextPayload, AiChatSession } from '../types/ai';
import { PetResponse } from '../types/pet';
import { calcularIdadePet } from '../utils/petUtils';

const pythonClient = axios.create({
  baseURL: env.aiUrl,
  timeout: 75000,
  headers: {
    'Content-Type': 'application/json',
  },
});

function formatPetContext(pet?: PetResponse): AiPetContextPayload | undefined {
  if (!pet) return undefined;
  const idadePet = calcularIdadePet(pet.dataNasc);
  return {
    id: pet.id,
    nome: pet.nome,
    raca: pet.raca,
    porte: pet.porte,
    dataNasc: pet.dataNasc,
    idade: idadePet,
    sexo: pet.sexo,
    castrado: pet.castrado,
  };
}

let inFlightAiPing: Promise<boolean> | null = null;
let lastAiPingTimestamp = 0;
const AI_PING_COOLDOWN_MS = 10 * 60 * 1000; // 10 minutos de intervalo mínimo

interface MensagemBancoRaw {
  id: number;
  session_id: string;
  pet_id?: number;
  sender: string;
  text: string;
  timestamp?: string;
}

function mapMensagemBancoToAiMessage(m: MensagemBancoRaw): AiMessage {
  return {
    id: `sqlite_${m.id}`,
    sender: m.sender === 'user' ? 'user' : 'assistant',
    text: m.text,
    timestamp: m.timestamp
      ? new Date(m.timestamp).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
      : '',
  };
}

export const AiService = {
  // Realiza um ping leve no servidor Python para acordar a instância no Render (warm-up de cold start)
  // Possui deduplicação estrita de promessa em voo e cooldown de 10 minutos para evitar requisições redundantes.
  async ping(): Promise<boolean> {
    const now = Date.now();

    if (now - lastAiPingTimestamp < AI_PING_COOLDOWN_MS) {
      return true;
    }

    if (inFlightAiPing) {
      return inFlightAiPing;
    }

    inFlightAiPing = (async () => {
      try {
        await pythonClient.get('/');
        lastAiPingTimestamp = Date.now();
        return true;
      } catch {
        return false;
      } finally {
        inFlightAiPing = null;
      }
    })();

    return inFlightAiPing;
  },

  // Consulta o microserviço Python para obter insights preventivos gerados por IA
  async getInsightsDoPet(pet?: PetResponse): Promise<AiPetInsight[]> {
    if (!pet) return [];

    const petContext = formatPetContext(pet);

    try {
      const response = await pythonClient.post('/ai/insights', petContext);
      if (response.data && Array.isArray(response.data.insights) && response.data.insights.length > 0) {
        return response.data.insights;
      }
    } catch {
      // Retorna array vazio em caso de instabilidade para não injetar dados mockados
      return [];
    }

    return [];
  },

  // Envia a mensagem do tutor diretamente para a IA Generativa (Google Gemini 3.5 Flash Lite com histórico)
  async enviarMensagem(
    pergunta: string,
    pet?: PetResponse,
    historico?: AiMessage[],
    sessionId?: string
  ): Promise<AiMessage> {
    const petContext = formatPetContext(pet);
    const horaAtual = new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });

    const historicoPayload = historico
      ?.filter((m) => m.text && m.text.trim().length > 0 && !m.id.startsWith('welcome_'))
      .map((m) => ({
        sender: m.sender === 'user' ? ('user' as const) : ('assistant' as const),
        text: m.text,
      }))
      .slice(-6);

    try {
      const response = await pythonClient.post<AiChatResponsePayload>('/ai/chat', {
        pergunta,
        petContext,
        historico: historicoPayload,
        sessionId,
      });

      if (response.data && response.data.resposta) {
        return {
          id: `ai_msg_${Date.now()}`,
          sender: 'assistant',
          text: response.data.resposta,
          timestamp: horaAtual,
          categoria: response.data.categoria,
          urgencia: response.data.urgencia,
          acoesRecomendadas: response.data.acoes_recomendadas,
        };
      }
    } catch {
      // Exceção de rede ou indisponibilidade da IA
    }

    // Retorna mensagem de contingência profissional e amigável ao tutor
    return {
      id: `ai_err_${Date.now()}`,
      sender: 'assistant',
      text: '⚠️ Não foi possível se comunicar com os servidores da Guardian AI no momento. Isso pode ocorrer por oscilações temporárias de conexão ou inicialização do serviço em nuvem. Por favor, tente enviar sua mensagem novamente em instantes.',
      timestamp: horaAtual,
      urgencia: 'BAIXA',
    };
  },

  // Consulta as sessões de chat anteriores do pet (estilo ChatGPT/Claude)
  async getSessoesDoPet(petId?: number): Promise<AiChatSession[]> {
    if (!petId) return [];

    try {
      const response = await pythonClient.get<{
        total: number;
        sessoes: Array<{
          session_id: string;
          titulo: string;
          total_mensagens: number;
          last_activity?: string;
        }>;
      }>('/ai/sessions', {
        params: { pet_id: petId, limit: 30 },
      });

      if (response.data && Array.isArray(response.data.sessoes)) {
        return response.data.sessoes.map((s) => ({
          sessionId: s.session_id,
          titulo: s.titulo,
          totalMensagens: s.total_mensagens,
          lastActivity: s.last_activity,
        }));
      }
    } catch {
      return [];
    }

    return [];
  },

  // Recupera todas as mensagens de uma conversa específica pelo sessionId
  async getMensagensDaSessao(sessionId: string): Promise<AiMessage[]> {
    if (!sessionId) return [];

    try {
      const response = await pythonClient.get<{
        total: number;
        mensagens: MensagemBancoRaw[];
      }>('/ai/history', {
        params: { session_id: sessionId, limit: 100 },
      });

      if (response.data && Array.isArray(response.data.mensagens)) {
        return response.data.mensagens.map(mapMensagemBancoToAiMessage);
      }
    } catch {
      return [];
    }

    return [];
  },

  // Exclui permanentemente uma sessão de chat e seus registros associados
  async excluirSessao(sessionId: string): Promise<boolean> {
    if (!sessionId) return false;

    try {
      const response = await pythonClient.delete<{ status: string; session_id: string }>(
        `/ai/sessions/${sessionId}`
      );
      return response.data.status === 'ok';
    } catch {
      return false;
    }
  },
};
