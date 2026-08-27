import { TrainingLesson, TrainingTrack } from '../types/training';

const TRILHAS_TREINAMENTO: TrainingTrack[] = [
  {
    id: 'trilha_obediencia_basica',
    categoria: 'Obediência Básica',
    titulo: 'Primeiros Comandos',
    descricao: 'Aprenda os comandos fundamentais para segurança e harmonia no lar.',
    nivel: 1,
    icone: 'dog',
    cor: '#0066FF',
    licoes: [
      {
        id: 'licao_sentar',
        titulo: 'Comando "Senta!"',
        descricao: 'Ensine o pet a sentar sob comando com petiscos e reforço positivo.',
        pontos: 25,
        icone: 'paw',
        duracaoMin: 5,
        concluido: false,
        passos: [
          'Segure um petisco perto do focinho do pet.',
          'Mova sua mão para cima e para trás, fazendo a cabeça subir e o bumbum descer.',
          'Assim que sentar, diga com clareza "Senta!" e dê o petisco com carinho.',
          'Repita de 5 a 10 vezes ao dia em sessões curtas.',
        ],
      },
      {
        id: 'licao_ficar',
        titulo: 'Comando "Fica!"',
        descricao: 'Desenvolva o autocontrole do pet para esperar em segurança.',
        pontos: 35,
        icone: 'hand-back-right',
        duracaoMin: 7,
        concluido: false,
        passos: [
          'Peça para o pet sentar primeiro.',
          'Abra a palma da mão virada para ele e diga "Fica!".',
          'Dê um passo para trás. Se ele não levantar, volte e recompense.',
          'Aumente a distância e o tempo gradualmente.',
        ],
      },
      {
        id: 'licao_aqui',
        titulo: 'Comando "Vem Cá / Aqui!"',
        descricao: 'O comando mais importante para evitar fugas e perigos.',
        pontos: 50,
        icone: 'run-fast',
        duracaoMin: 10,
        concluido: false,
        passos: [
          'Abaixe-se na altura do pet e abra os braços com tom alegre.',
          'Diga o nome do pet seguido de "Vem!".',
          'Quando ele chegar até você, recompense com muita festa e petisco especial.',
          'Nunca use este comando para dar bronca ou castigo.',
        ],
      },
    ],
  },
  {
    id: 'trilha_socializacao',
    categoria: 'Socialização & Ansiedade',
    titulo: 'Passeio Calmo & Socialização',
    descricao: 'Reduza puxões na guia e a ansiedade de separação.',
    nivel: 2,
    icone: 'walk',
    cor: '#58CC02',
    licoes: [
      {
        id: 'licao_guia_frouxa',
        titulo: 'Passeio com Guia Frouxa',
        descricao: 'Faça passeios prazerosos sem que o cão fique puxando a guia.',
        pontos: 40,
        icone: 'leash',
        duracaoMin: 15,
        concluido: false,
        passos: [
          'Comece a andar. No momento em que a guia esticar, pare completamente de andar.',
          'Espere o cão olhar para você ou dar um passo atrás afrouxando a guia.',
          'Recompense e continue andando.',
          'A consistência é a chave para o cão entender que puxar não o faz avançar.',
        ],
      },
      {
        id: 'licao_ansiedade_separacao',
        titulo: 'Treino de Despedida Calma',
        descricao: 'Ensine o pet a ficar tranquilo quando você sair de casa.',
        pontos: 45,
        icone: 'home-heart',
        duracaoMin: 10,
        concluido: false,
        passos: [
          'Faça pequenos treinos: pegue a chave e sente no sofá sem sair.',
          'Saia de casa por 1 minuto e retorne sem festa exagerada.',
          'Deixe brinquedos recheados com comida congelada para entretê-lo.',
          'Aumente o tempo gradativamente.',
        ],
      },
    ],
  },
  {
    id: 'trilha_truques',
    categoria: 'Truques & Estímulo Mental',
    titulo: 'Truques Divertidos & Agilidade',
    descricao: 'Estimule a inteligência do seu pet com truques divertidos.',
    nivel: 3,
    icone: 'star-circle',
    cor: '#FF9600',
    licoes: [
      {
        id: 'licao_dar_pata',
        titulo: 'Dar a Patinha',
        descricao: 'O truque clássico que fortalece o vínculo tutor-pet.',
        pontos: 30,
        icone: 'hand-peace',
        duracaoMin: 5,
        concluido: false,
        passos: [
          'Peça para o pet sentar.',
          'Feche a mão com o petisco na frente dele.',
          'Quando ele tocar sua mão com a pata, diga "Dá a pata!", abra a mão e dê o petisco.',
          'Repita até ele oferecer a pata ao ouvir o comando.',
        ],
      },
      {
        id: 'licao_girar',
        titulo: 'Girar 360 Graus',
        descricao: 'Exercício divertido de flexibilidade e coordenação.',
        pontos: 40,
        icone: 'rotate-right',
        duracaoMin: 5,
        concluido: false,
        passos: [
          'Com o pet em pé, conduza o petisco em círculo perto do focinho.',
          'À medida que ele acompanha o círculo completo, diga "Gira!".',
          'Entregue o petisco no final da rotação.',
        ],
      },
    ],
  },
];

export const TrainingService = {
  async getTrilhas(): Promise<TrainingTrack[]> {
    return TRILHAS_TREINAMENTO;
  },

  async getTrilhaById(id: string): Promise<TrainingTrack | undefined> {
    return TRILHAS_TREINAMENTO.find((t) => t.id === id);
  },

  async concluirLicao(trilhaId: string, licaoId: string): Promise<{ pontosGanhos: number }> {
    const trilha = TRILHAS_TREINAMENTO.find((t) => t.id === trilhaId);
    const licao = trilha?.licoes.find((l) => l.id === licaoId);
    if (licao) {
      licao.concluido = true;
      return { pontosGanhos: licao.pontos };
    }
    return { pontosGanhos: 0 };
  },
};
