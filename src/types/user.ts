export interface EnderecoRequest {
  cep: string;
  numero: string;
}

export interface EnderecoResponse {
  id: number;
  cep: string;
  numero: string;
  rua: string;
  bairro: string;
  cidade: string;
  estado: string;
}

export interface UsuarioRequest {
  nome: string;
  email: string;
  senha: string;
  ddd: string;
  numeroTelefone: string;
  endereco: EnderecoRequest;
}

export interface UsuarioResponse {
  id: number;
  nome: string;
  email: string;
  ddd: string;
  numeroTelefone: string;
  enderecos: EnderecoResponse[];
}

export interface PetResumo {
  id: number;
  nome: string;
  raca: string;
  responsavelPrincipal: boolean;
  tarefaIds: number[];
}

export interface CuidadorResumo {
  id: number;
  nome: string;
  email: string;
  responsavelPrincipal: boolean;
  petIds: number[];
}

export interface RedeCuidadoResponse {
  usuarioId: number;
  nomeUsuario: string;
  pets: PetResumo[];
  coCuidadores: CuidadorResumo[];
  totalTarefasPendentes: number;
  totalTarefasConcluidas: number;
  pontosAcumulados: number;
}
