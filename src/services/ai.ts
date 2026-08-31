import axios from 'axios';
import { Platform } from 'react-native';
import { AiMessage, AiPetInsight, AiChatResponsePayload, AiPetContextPayload } from '../types/ai';
import { PetResponse } from '../types/pet';
import { calcularIdadePet } from '../utils/petUtils';

// Base URL do microserviço Python (FastAPI / Gemini 3.5 Flash Lite / RAG)
const PYTHON_AI_URL = Platform.select({
  android: 'http://10.0.2.2:8000',
  ios: 'http://localhost:8000',
  default: 'http://localhost:8000',
});

const pythonClient = axios.create({
  baseURL: PYTHON_AI_URL,
  timeout: 10000,
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
    if (!pet) {
      return [
        {
          categoria: 'saude',
          titulo: 'Selecione ou cadastre um pet',
          descricao: 'Selecione um animal de estimação para receber orientações preventivas personalizadas por inteligência artificial.',
          urgencia: 'baixa',
        },
      ];
    }

    const petContext = formatPetContext(pet);

    try {
      const response = await pythonClient.post('/ai/insights', petContext);
      if (response.data && Array.isArray(response.data.insights) && response.data.insights.length > 0) {
        return response.data.insights;
      }
    } catch {
      // Caso ocorra falha de conexão com a API de IA
    }

    return [
      {
        categoria: 'saude',
        titulo: 'Insights de IA em processamento',
        descricao: `As recomendações inteligentes para ${pet.nome} serão atualizadas assim que houver conexão com o assistente de IA.`,
        urgencia: 'baixa',
      },
    ];
  },

  // Envia a mensagem do tutor diretamente para a IA Generativa (Google Gemini 3.5 Flash Lite)
  async enviarMensagem(pergunta: string, pet?: PetResponse | null): Promise<AiMessage> {
    const petContext = formatPetContext(pet);
    const horaAtual = new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });

    try {
      const response = await pythonClient.post<AiChatResponsePayload>('/ai/chat', {
        pergunta,
        petContext,
      });

      if (response.data && response.data.resposta) {
        return {
          id: `ai_msg_${Date.now()}`,
          sender: 'assistant',
          text: response.data.resposta,
          timestamp: horaAtual,
          categoria: response.data.categoria,
          urgencia: response.data.urgencia,
          alertaClinica24h: response.data.alerta_clinica_24h,
          acoesRecomendadas: response.data.acoes_recomendadas,
          scoreXpSugerido: response.data.score_xp_sugerido,
        };
      }
    } catch {
      // Exceção de rede ou indisponibilidade da IA
    }

    // Retorna mensagem de erro de conexão com a IA quando o microserviço não responder
    return {
      id: `ai_err_${Date.now()}`,
      sender: 'assistant',
      text: `Não foi possível se comunicar com o assistente de IA no momento. Verifique se o microserviço Python da IA está em execução (porta 8000) e tente novamente.`,
      timestamp: horaAtual,
      urgencia: 'BAIXA',
    };
  },
};
