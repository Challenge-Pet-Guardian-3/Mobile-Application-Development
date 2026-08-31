export type AiUrgency = 'BAIXA' | 'MEDIA' | 'ALTA' | 'EMERGENCIA' | 'baixa' | 'media' | 'alta';
export type AiCategory = 'SAUDE' | 'NUTRICAO' | 'COMPORTAMENTO' | 'ROTINA' | 'EMERGENCIA' | 'GERAL' | 'FORA_DE_ESCOPO' | 'nutricao' | 'saude' | 'comportamento' | 'rotina';

export interface AiMessage {
  id: string;
  sender: 'user' | 'assistant' | 'system';
  text: string;
  timestamp: string;
  categoria?: AiCategory;
  urgencia?: AiUrgency;
  alertaClinica24h?: boolean;
  acoesRecomendadas?: string[];
  scoreXpSugerido?: number;
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
  peso?: string;
  alergias?: string;
  medicamentos?: string;
  ultimaVacina?: string;
  ultimaConsulta?: string;
}

export interface AiChatResponsePayload {
  resposta: string;
  categoria?: AiCategory;
  urgencia?: AiUrgency;
  alerta_clinica_24h?: boolean;
  acoes_recomendadas?: string[];
  score_xp_sugerido?: number;
  origem_resposta?: string;
}
