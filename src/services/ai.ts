import axios from 'axios';
import { Platform } from 'react-native';
import { AiMessage, AiPetInsight } from '../types/ai';
import { PetResponse } from '../types/pet';
import { calcularIdadePet } from '../utils/petUtils';

// Base URL do microserviço Python (FastAPI / LangChain / RAG)
const PYTHON_AI_URL = Platform.select({
  android: 'http://10.0.2.2:8000',
  ios: 'http://localhost:8000',
  default: 'http://localhost:8000',
});

const pythonClient = axios.create({
  baseURL: PYTHON_AI_URL,
  timeout: 4000,
});

export const AiService = {
  // Retorna recomendações preventivas baseadas no perfil do pet ativo
  async getInsightsDoPet(pet?: PetResponse | null): Promise<AiPetInsight[]> {
    if (!pet) {
      return [
        {
          categoria: 'saude',
          titulo: 'Adicione um pet para orientações',
          descricao: 'Cadastre seu animal de estimação para receber dicas personalizadas de saúde e nutrição por inteligência artificial.',
          urgencia: 'baixa',
        },
      ];
    }

    const idadePet = calcularIdadePet(pet.dataNasc, pet.idade);

    try {
      // Tenta consultar o microserviço Python FastAPI
      const response = await pythonClient.post('/ai/insights', {
        nome: pet.nome,
        raca: pet.raca,
        dataNasc: pet.dataNasc,
        idade: idadePet,
        porte: pet.porte,
        sexo: pet.sexo,
        castrado: pet.castrado,
      });
      if (response.data && Array.isArray(response.data.insights)) {
        return response.data.insights;
      }
    } catch {
      // Fallback inteligente caso o backend Python ainda não esteja rodando
    }

    const insights: AiPetInsight[] = [];

    // Análise por Porte
    if (pet.porte === 'GRANDE') {
      insights.push({
        categoria: 'saude',
        titulo: `Cuidados Articulares para ${pet.nome}`,
        descricao: `Pets de porte grande como ${pet.raca || 'esta raça'} têm maior tendência a displasias. Mantenha passeios regulares em superfícies macias e controle o ganho de peso.`,
        urgencia: 'media',
      });
    } else if (pet.porte === 'PEQUENO') {
      insights.push({
        categoria: 'saude',
        titulo: `Atenção à Saúde Bucal de ${pet.nome}`,
        descricao: 'Cães de porte pequeno têm maior acúmulo de tártaro. Recomendamos escovação dental com pasta própria 3x na semana.',
        urgencia: 'baixa',
      });
    }

    // Análise de Idade
    if (idadePet >= 7) {
      insights.push({
        categoria: 'nutricao',
        titulo: 'Fase Sênior: Exames de Rotina',
        descricao: `${pet.nome} tem ${idadePet} anos e está na melhor idade. Um check-up com exames de sangue e ecocardiograma semestral garante longevidade.`,
        urgencia: 'alta',
      });
    } else {
      insights.push({
        categoria: 'nutricao',
        titulo: 'Hidratação e Estímulo Diário',
        descricao: `Garanta água fresca e trocada duas vezes ao dia para ${pet.nome}, especialmente nos dias mais quentes.`,
        urgencia: 'baixa',
      });
    }

    // Análise de Castração
    if (!pet.castrado) {
      insights.push({
        categoria: 'saude',
        titulo: 'Orientações sobre Castração Preventiva',
        descricao: 'A castração reduz drasticamente o risco de infecções uterinas em fêmeas e problemas de próstata em machos. Converse com o veterinário.',
        urgencia: 'media',
      });
    }

    return insights;
  },

  // Responde perguntas do tutor via chat com contexto do pet
  async enviarMensagem(pergunta: string, pet?: PetResponse | null): Promise<AiMessage> {
    const idadePet = pet ? calcularIdadePet(pet.dataNasc, pet.idade) : undefined;

    try {
      // Tenta enviar mensagem para o microserviço Python FastAPI
      const response = await pythonClient.post('/ai/chat', {
        pergunta,
        petContext: pet ? {
          nome: pet.nome,
          raca: pet.raca,
          dataNasc: pet.dataNasc,
          idade: idadePet,
          porte: pet.porte,
          castrado: pet.castrado,
        } : null,
      });

      if (response.data && response.data.resposta) {
        return {
          id: `ai_msg_${Date.now()}`,
          sender: 'assistant',
          text: response.data.resposta,
          timestamp: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
        };
      }
    } catch {
      // Fallback com base de conhecimento local RAG se o Python não estiver conectado
    }

    const textoFormatado = pergunta.toLowerCase();
    let resposta = `Olá! Sou a Assistente PetGuardian. Com base nas informações de ${pet ? pet.nome : 'seu pet'}, estou aqui para apoiar você com dicas de cuidados preventivos, rotina e bem-estar!`;

    if (textoFormatado.includes('vacina') || textoFormatado.includes('v10') || textoFormatado.includes('raiva')) {
      resposta = `As vacinas essenciais (V8/V10 e Antirrábica) devem ser reforçadas anualmente. Se ${pet ? pet.nome : 'o pet'} tiver contato com outros animais ou passear muito na rua, considere também a vacina da Gripe Canina e Giárdia.`;
    } else if (textoFormatado.includes('aliment') || textoFormatado.includes('comida') || textoFormatado.includes('ração')) {
      resposta = `Para um pet de porte ${pet ? pet.porte.toLowerCase() : 'médio'}, divida a porção diária de ração de alta qualidade em 2 a 3 refeições. Evite sempre dar alimentos tóxicos como chocolate, cebola, uvas e doces com xilitol.`;
    } else if (textoFormatado.includes('ansied') || textoFormatado.includes('chora') || textoFormatado.includes('sozinho')) {
      resposta = `Para amenizar a ansiedade de separação, faça enriquecimento ambiental: ofereça brinquedos recheáveis com patê congelado e evite despedidas ou recepções muito eufóricas ao sair e voltar de casa.`;
    } else if (textoFormatado.includes('pontos') || textoFormatado.includes('score') || textoFormatado.includes('duolingo') || textoFormatado.includes('trein')) {
      resposta = `Você pode somar pontos ao score do pet concluindo as tarefas de rotina na Home e praticando as lições na aba de Trilhas! Cada conclusão fortalece os hábitos saudáveis da família.`;
    }

    return {
      id: `ai_msg_${Date.now()}`,
      sender: 'assistant',
      text: resposta,
      timestamp: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
    };
  },
};
