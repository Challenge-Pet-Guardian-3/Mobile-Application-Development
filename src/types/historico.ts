export interface HistoricoRequest {
  tipoHist: string;
  dataHist: string; // ISO format e.g. 'YYYY-MM-DDTHH:mm:ss'
  petId: number;
}

export interface HistoricoResponse {
  id: number;
  tipoHist: string;
  dataHist: string; // ISO format
  petId: number;
  nomePet?: string;
}
