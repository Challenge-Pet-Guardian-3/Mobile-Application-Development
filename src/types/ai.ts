export interface AiMessage {
  id: string;
  sender: 'user' | 'assistant' | 'system';
  text: string;
  timestamp: string;
  tags?: string[];
}

export interface AiPetInsight {
  titulo: string;
  descricao: string;
  categoria: 'nutricao' | 'saude' | 'comportamento' | 'rotina';
  urgencia: 'baixa' | 'media' | 'alta';
}
