import axios from 'axios';
import { env } from '../config/env';
import { AiMessage, AiPetInsight, AiChatResponsePayload, AiPetContextPayload } from '../types/ai';
import { PetResponse } from '../types/pet';
import { calcularIdadePet } from '../utils/petUtils';

const pythonClient = axios.create({
  baseURL: env.aiUrl,
  timeout: 12000,
  headers: {
    'Content-Type': 'application/json',
  },
});

function formatPetContext(pet?: PetResponse | null): AiPetContextPayload | null {
  if (!pet) return null;
  const idadePet = calcularIdadePet(pet.dataNasc, pet.idade);
  return {
    id: pet.id,
    nome: pet.nome,
    raca: pet.raca,
    porte: pet.porte,
    dataNasc: pet.dataNasc,
    idade: idadePet,
    sexo: pet.sexo,
    castrado: pet.castrado,
    peso: pet.peso,
    alergias: pet.alergias,
    medicamentos: pet.medicamentos,
    ultimaVacina: pet.ultimaVacina,
    ultimaConsulta: pet.ultimaConsulta,
  };
}

export const AiService = {
  // Consulta o microserviço Python para obter insights preventivos gerados por IA
  async getInsightsDoPet(pet?: PetResponse | null): Promise<AiPetInsight[]> {
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
    pet?: PetResponse | null,
    historico?: AiMessage[]
  ): Promise<AiMessage> {
    const petContext = formatPetContext(pet);
    const horaAtual = new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });

    const historicoPayload = historico
      ?.filter((m) => m.text && m.text.trim().length > 0 && !m.id.startsWith('welcome_'))
      .map((m) => ({
        sender: m.sender === 'user' ? ('user' as const) : ('assistant' as const),
        text: m.text,
      }));

    try {
      const response = await pythonClient.post<AiChatResponsePayload>('/ai/chat', {
        pergunta,
        petContext,
        historico: historicoPayload,
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
          scoreXpSugerido: response.data.score_xp_sugerido,
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
};
