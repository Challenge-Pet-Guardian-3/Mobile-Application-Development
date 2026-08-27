import { ClinicaResponse, FiltroClinica } from '../types/clinic';

// Catálogo de clínicas parceiras e atendimento 24h
const CLINICAS_MOCK: ClinicaResponse[] = [
  {
    id: 1,
    nome: 'Hospital Veterinário Clyvo 24h',
    telefone: '(11) 3456-7890',
    rua: 'Av. Paulista',
    numero: '1106',
    bairro: 'Bela Vista',
    cidade: 'São Paulo',
    estado: 'SP',
    atendimento24h: true,
    prontoSocorro: true,
    patrocinada: true,
    avaliacao: 4.9,
    distanciaKm: 1.2,
    especialidades: ['Emergência 24h', 'Cirurgia', 'UTI', 'Raio-X', 'Ultrassom'],
  },
  {
    id: 2,
    nome: 'Pronto Socorro Pet São Paulo',
    telefone: '(11) 2345-6789',
    rua: 'Rua Domingos de Morais',
    numero: '2564',
    bairro: 'Vila Mariana',
    cidade: 'São Paulo',
    estado: 'SP',
    atendimento24h: true,
    prontoSocorro: true,
    patrocinada: true,
    avaliacao: 4.8,
    distanciaKm: 2.5,
    especialidades: ['Pronto-Socorro', 'Ortopedia', 'Internação'],
  },
  {
    id: 3,
    nome: 'Clínica Veterinária Vida Animal',
    telefone: '(11) 98765-4321',
    rua: 'Rua Augusta',
    numero: '1500',
    bairro: 'Consolação',
    cidade: 'São Paulo',
    estado: 'SP',
    atendimento24h: false,
    prontoSocorro: false,
    patrocinada: false,
    avaliacao: 4.6,
    distanciaKm: 3.1,
    especialidades: ['Vacinação', 'Consultas', 'Dermatologia'],
  },
  {
    id: 4,
    nome: 'Centro Médico Veterinário Jardins',
    telefone: '(11) 3088-1234',
    rua: 'Alameda Lorena',
    numero: '850',
    bairro: 'Jardins',
    cidade: 'São Paulo',
    estado: 'SP',
    atendimento24h: true,
    prontoSocorro: true,
    patrocinada: true,
    avaliacao: 4.9,
    distanciaKm: 3.8,
    especialidades: ['Emergência', 'Cardiologia', 'Exames Laboratoriais'],
  },
  {
    id: 5,
    nome: 'PetCare Higienópolis',
    telefone: '(11) 3662-9988',
    rua: 'Rua Maranhão',
    numero: '420',
    bairro: 'Higienópolis',
    cidade: 'São Paulo',
    estado: 'SP',
    atendimento24h: true,
    prontoSocorro: false,
    patrocinada: false,
    avaliacao: 4.7,
    distanciaKm: 4.5,
    especialidades: ['Consultas 24h', 'Oftalmologia', 'Acupuntura'],
  },
];

export const ClinicService = {
  async getClinicas(filtro?: FiltroClinica): Promise<ClinicaResponse[]> {
    let lista = [...CLINICAS_MOCK];

    if (filtro?.somente24h) {
      lista = lista.filter((c) => c.atendimento24h);
    }
    if (filtro?.somenteProntoSocorro) {
      lista = lista.filter((c) => c.prontoSocorro);
    }
    if (filtro?.termoBusca && filtro.termoBusca.trim() !== '') {
      const termo = filtro.termoBusca.toLowerCase().trim();
      lista = lista.filter(
        (c) =>
          c.nome.toLowerCase().includes(termo) ||
          c.bairro.toLowerCase().includes(termo) ||
          c.especialidades.some((e) => e.toLowerCase().includes(termo))
      );
    }

    // Ordenar patrocinadas no topo (estilo iFood)
    lista.sort((a, b) => {
      if (a.patrocinada && !b.patrocinada) return -1;
      if (!a.patrocinada && b.patrocinada) return 1;
      return (a.distanciaKm || 0) - (b.distanciaKm || 0);
    });

    return lista;
  },

  async getClinicaById(id: number): Promise<ClinicaResponse | undefined> {
    return CLINICAS_MOCK.find((c) => c.id === id);
  },
};
