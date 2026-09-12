export type AiUrgency = 'BAIXA' | 'MEDIA' | 'ALTA' | 'EMERGENCIA' | 'baixa' | 'media' | 'alta';
export type AiCategory = 'SAUDE' | 'NUTRICAO' | 'COMPORTAMENTO' | 'ROTINA' | 'EMERGENCIA' | 'GERAL' | 'FORA_DE_ESCOPO' | 'nutricao' | 'saude' | 'comportamento' | 'rotina';

export interface AiMessage {
  id: string;
  sender: 'user' | 'assistant' | 'system';
  text: string;
  timestamp: string;
  categoria?: AiCategory;
  urgencia?: AiUrgency;
  acoesRecomendadas?: string[];
  tags?: string[];
}

export interface AiPetInsight {
  titulo: string;
  descricao: string;
  categoria: 'nutricao' | 'saude' | 'comportamento' | 'rotina';
  urgencia: 'baixa' | 'media' | 'alta';
}

export interface AiPetContextPayload {
  id?: number;
  nome?: string;
  raca?: string;
  porte?: string;
  dataNasc?: string;
  idade?: number;
  sexo?: string;
  castrado?: boolean;
}

export interface AiMessageHistoricoItem {
  sender: 'user' | 'assistant' | 'model';
  text: string;
}

export interface AiChatRequestPayload {
  pergunta: string;
  petContext?: AiPetContextPayload;
  historico?: AiMessageHistoricoItem[];
  sessionId?: string;
}

export interface AiChatResponsePayload {
  resposta: string;
  categoria?: AiCategory;
  urgencia?: AiUrgency;
  acoes_recomendadas?: string[];
  origem_resposta?: string;
}
