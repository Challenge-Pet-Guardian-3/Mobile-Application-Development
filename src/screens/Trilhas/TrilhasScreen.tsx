import React, { useState, useMemo } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  Platform,
  Alert,
  ActivityIndicator
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { Header } from '../../components/Header';
import { LicaoPraticaModal } from '../../components/LicaoPraticaModal/LicaoPraticaModal';
import { useTrilhas } from '../../hooks/useTrilhas';
import { usePets } from '../../hooks/usePets';

type IconeMaterial = React.ComponentProps<typeof MaterialCommunityIcons>['name'];

export interface PassoTrilha {
  id: string;
  titulo: string;
  descricao: string;
  objetivoPet: string;
  icone: IconeMaterial;
  status: 'concluido' | 'atual' | 'bloqueado';
  tipo: 'licao' | 'bau' | 'estrela';
  xp: number;
  offsetX: number;
  passoAPasso: string[];
  dicasCorrecao: {
    excelente: string;
    medo: string;
    agitado: string;
    desinteresse: string;
  };
}

export interface SecaoTrilha {
  id: string;
  numero: number;
  titulo: string;
  subtitulo: string;
  corTema: string;
  corBorda: string;
  passos: PassoTrilha[];
}

// Catálogo estático: textos, ícones e XP de cada etapa. O campo "status" aqui
// é só um placeholder — o status real é sempre recalculado por construirSecoesComProgresso.
const SECOES_CATALOGO: SecaoTrilha[] = [
  {
    id: 'sec-1',
    numero: 1,
    titulo: 'Estimulação Mental & Foco',
    subtitulo: 'SEÇÃO 1 • ENRIQUECIMENTO AMBIENTAL',
    corTema: '#58CC02',
    corBorda: '#46A302',
    passos: [
      {
        id: '1-1',
        titulo: 'Apresentação Olfativa',
        descricao: 'Esconda petiscos em recipientes para ativar o instinto natural de farejar.',
        objetivoPet: 'Gasta energia cognitiva e reduz o cortisol basal.',
        icone: 'magnify',
        status: 'bloqueado',
        tipo: 'licao',
        xp: 20,
        offsetX: 0,
        passoAPasso: [
          'Pegue 3 copos plásticos opacos e coloque um petisco de forte odor embaixo de apenas um deles.',
          'Aponte para os copos e diga "Procura!" com tom calmo e incentivador.',
          'Quando o pet tocar o copo certo com o focinho ou a pata, levante o copo imediatamente e comemore.'
        ],
        dicasCorrecao: {
          excelente: 'Excelente! O pet compreendeu a busca olfativa. Aumente o desafio espalhando os copos pelo cômodo.',
          medo: 'O pet hesitou. Dica: Deixe o copo semiaberto para o cheiro sair fácil e não faça movimentos bruscos.',
          agitado: 'O pet tentou morder ou derrubar todos os copos. Dica: Segure o pet suavemente até ele farejar com calma.',
          desinteresse: 'O pet ignorou o treino. Dica: Use uma recompensa com cheiro mais forte (ex: frango desfiado).'
        }
      },
      {
        id: '1-2',
        titulo: 'Tapete de Fuçar Caseiro',
        descricao: 'Crie um enigma com toalha enrolada e grãos de ração dentro.',
        objetivoPet: 'Estimula a resolução autônoma de problemas.',
        icone: 'puzzle-outline',
        status: 'bloqueado',
        tipo: 'licao',
        xp: 25,
        offsetX: -45,
        passoAPasso: [
          'Estenda uma toalha limpa no chão e espalhe grãos de ração ao longo dela.',
          'Enrole a toalha no formato de rocambole com as recompensas presas nas dobras.',
          'Coloque no chão e deixe o animal usar o focinho e as patas para desenrolar no próprio ritmo.'
        ],
        dicasCorrecao: {
          excelente: 'Ele resolveu com calma e foco! Esse exercício diminui o tédio e a ansiedade.',
          medo: 'O pet achou a toalha intimidadora. Dica: Dobre apenas uma ponta, deixando o petisco visível.',
          agitado: 'O pet tentou rasgar a toalha. Dica: Segure uma ponta firme e aponte a abertura para guiá-lo.',
          desinteresse: 'O pet perdeu o foco. Dica: Esconda petiscos mais saborosos nas primeiras dobras.'
        }
      },
      {
        id: '1-3',
        titulo: 'Marco: Explorador Curioso',
        descricao: 'Seu pet já domina jogos olfativos e raciocínio investigativo.',
        objetivoPet: 'Conquista coletiva de enriquecimento mental.',
        icone: 'treasure-chest',
        status: 'bloqueado',
        tipo: 'bau',
        xp: 50,
        offsetX: 0,
        passoAPasso: [
          'Recompensa de marco desbloqueada!',
          'Reúna a família e comemore a evolução do pet no enriquecimento mental.'
        ],
        dicasCorrecao: {
          excelente: 'Marco concluído com louvor pela matilha!',
          medo: 'Continue repetindo os treinos anteriores em ritmo leve.',
          agitado: 'Mantenha a rotina diária de 5 minutos.',
          desinteresse: 'Alterne os petiscos para manter o interesse.'
        }
      },
      {
        id: '1-4',
        titulo: 'Caixa de Desafios Caseira',
        descricao: 'Encha uma caixa de papelão com folhas de papel amassadas e petiscos soltos.',
        objetivoPet: 'Incentiva a exploração física e sensorial.',
        icone: 'package-variant-closed',
        status: 'bloqueado',
        tipo: 'licao',
        xp: 30,
        offsetX: 45,
        passoAPasso: [
          'Pegue uma caixa rasa de papelão e coloque várias bolinhas de papel toalha ou folhas limpas.',
          'Jogue pedacinhos de petisco entre os papéis amassados.',
          'Incentive o pet a fuçar com as patas e o focinho para encontrar as recompensas.'
        ],
        dicasCorrecao: {
          excelente: 'Excelente exploração sensorial! O pet gastou bastante energia mental.',
          medo: 'O barulho do papel assustou. Dica: Use tiras de tecido ou toalhas pequenas no lugar de papel.',
          agitado: 'O pet tentou comer o papel. Dica: Supervisione e troque o papel por brinquedos de pelúcia na caixa.',
          desinteresse: 'Deixe alguns petiscos visíveis logo acima do papel para engajá-lo primeiro.'
        }
      },
      {
        id: '1-5',
        titulo: 'Mestre do Faro e Foco',
        descricao: 'Consolidação das habilidades de estímulo mental do animal.',
        objetivoPet: 'Pet mentalmente ativo e equilibrado.',
        icone: 'star-shooting',
        status: 'bloqueado',
        tipo: 'estrela',
        xp: 80,
        offsetX: 0,
        passoAPasso: ['Você completou a Seção 1! O pet aprendeu a canalizar energia em estímulos positivos.'],
        dicasCorrecao: {
          excelente: 'Seção 1 concluída com sucesso!',
          medo: 'Mantenha as práticas como brincadeiras regulares.',
          agitado: 'Continue com desafios de farejamento diários.',
          desinteresse: 'Varie os tipos de estímulo.'
        }
      }
    ]
  },
  {
    id: 'sec-2',
    numero: 2,
    titulo: 'Toque Cooperativo & Saúde',
    subtitulo: 'SEÇÃO 2 • HIGIENE E MANUSEIO CLÍNICO',
    corTema: '#0066FF',
    corBorda: '#004ECC',
    passos: [
      {
        id: '2-1',
        titulo: 'Dessensibilização das Patas',
        descricao: 'Acostume o pet com o toque nas almofadas plantares sem gerar desconforto.',
        objetivoPet: 'Prepara para o corte de unhas e limpeza pós-passeio sem traumas.',
        icone: 'paw',
        status: 'bloqueado',
        tipo: 'licao',
        xp: 30,
        offsetX: 0,
        passoAPasso: [
          'Sente-se tranquilamente e toque suavemente na pata dianteira por 1 segundo.',
          'Retire a mão imediatamente e dê um petisco saboroso, elogiando com voz calma.',
          'Repita 5 vezes. Se ele não puxar a pata, aumente para 3 segundos de toque.'
        ],
        dicasCorrecao: {
          excelente: 'O pet aceitou o toque com naturalidade! Avance tocando entre os dedos dele.',
          medo: 'O pet recuou ou puxou a pata. Dica: Toque primeiro no ombro/peito e recompense antes de descer para a pata.',
          agitado: 'O pet tentou morder a mão de brincadeira. Dica: Mantenha um petisco na outra mão para ele lamber enquanto toca.',
          desinteresse: 'O pet se afastou. Dica: Treine após um passeio, quando ele estiver mais relaxado.'
        }
      },
      {
        id: '2-2',
        titulo: 'Inspeção de Olhos e Orelhas',
        descricao: 'Ensine o pet a aceitar a aproximação das mãos na cabeça e orelhas.',
        objetivoPet: 'Facilita a aplicação de colírios, limpeza e exames clínicos.',
        icone: 'eye-outline',
        status: 'bloqueado',
        tipo: 'licao',
        xp: 35,
        offsetX: -40,
        passoAPasso: [
          'Aproxime a mão da orelha do pet, levante a orelha suavemente por 2 segundos e solte.',
          'Entregue uma recompensa imediatamente.',
          'Repita o mesmo processo nos dois lados sem fazer pressão ou movimentos rápidos.'
        ],
        dicasCorrecao: {
          excelente: 'Muito bem! A tolerância ao manuseio da cabeça está excelente.',
          medo: 'O pet desviou a cabeça. Dica: Apenas encoste na lateral do pescoço primeiro e recompense.',
          agitado: 'O pet ficou pulando. Dica: Peça para outro membro da família segurar um petisco na frente dele.',
          desinteresse: 'Mantenha as repetições curtas para não entediar o animal.'
        }
      },
      {
        id: '2-3',
        titulo: 'Marco: Cuidador Tranquilo',
        descricao: 'Seu pet já confia plenamente nas mãos da família para cuidados físicos.',
        objetivoPet: 'Vínculo de confiança e bem-estar consolidado.',
        icone: 'treasure-chest',
        status: 'bloqueado',
        tipo: 'bau',
        xp: 60,
        offsetX: 0,
        passoAPasso: ['Marco de cooperação física desbloqueado!'],
        dicasCorrecao: {
          excelente: 'A confiança mútua entre família e pet aumentou significativamente!',
          medo: 'Pratique toques suaves diariamente.',
          agitado: 'Mantenha a calma e voz serena nos treinos.',
          desinteresse: 'Treine sempre em momentos de repouso.'
        }
      },
      {
        id: '2-4',
        titulo: 'Escovação Amigável',
        descricao: 'Apresente a escova ou pente como um objeto positivo associado a recompensas.',
        objetivoPet: 'Evita brigas e estresse no momento da escovação do pelo.',
        icone: 'brush',
        status: 'bloqueado',
        tipo: 'licao',
        xp: 40,
        offsetX: 40,
        passoAPasso: [
          'Deixe o pet cheirar a escova parada no chão e recompense com um petisco.',
          'Passe as costas da escova (sem as cerdas) no dorso do pet por 2 segundos.',
          'Quando ele se acostumar com o toque do objeto, vire para as cerdas com movimentos leves.'
        ],
        dicasCorrecao: {
          excelente: 'O pet relaxou com a escovação! A manutenção da pelagem será muito mais simples.',
          medo: 'O pet fugiu da escova. Dica: Deixe a escova ao lado do comedouro dele por 2 dias para ele se acostumar.',
          agitado: 'O pet tentou morder a escova. Dica: Ofereça um mordedor para ele mastigar enquanto você escova o dorso.',
          desinteresse: 'Faça sessões de apenas 1 minuto por dia.'
        }
      },
      {
        id: '2-5',
        titulo: 'Guardião da Saúde Pet',
        descricao: 'Conclusão da trilha de cuidados corporais preventivos.',
        objetivoPet: 'Pet preparado para idas calmas ao veterinário.',
        icone: 'star-shooting',
        status: 'bloqueado',
        tipo: 'estrela',
        xp: 100,
        offsetX: 0,
        passoAPasso: ['Parabéns! O pet agora tolera toques de rotina com tranquilidade e confiança.'],
        dicasCorrecao: {
          excelente: 'Seção 2 finalizada com perfeição!',
          medo: 'Reforce o toque nas patas periodicamente.',
          agitado: 'Mantenha a postura tranquila durante a higiene.',
          desinteresse: 'Mantenha o treino leve e divertido.'
        }
      }
    ]
  },
  {
    id: 'sec-3',
    numero: 3,
    titulo: 'Autonomia & Equilíbrio',
    subtitulo: 'SEÇÃO 3 • INDEPENDÊNCIA E RUÍDOS',
    corTema: '#854CE6',
    corBorda: '#6B38C4',
    passos: [
      {
        id: '3-1',
        titulo: 'O Refúgio da Caminha',
        descricao: 'Transforme a cama em um refúgio de descanso autônomo com recompensas diárias.',
        objetivoPet: 'Gera segurança e diminui a dependência excessiva de atenção.',
        icone: 'home-heart',
        status: 'bloqueado',
        tipo: 'licao',
        xp: 35,
        offsetX: 0,
        passoAPasso: [
          'Jogue um petisco dentro da caminha e diga "Vai pro seu lugar".',
          'Quando o pet entrar com as 4 patas, entregue outro petisco diretamente no colchão.',
          'Deixe-o sair livremente sem forçar permanência no primeiro momento.'
        ],
        dicasCorrecao: {
          excelente: 'O pet associou a caminha a um lugar de paz e conforto.',
          medo: 'O pet preferiu o chão. Dica: Coloque uma peça de roupa sua na caminha com o seu cheiro.',
          agitado: 'O pet sai correndo em disparada. Dica: Entregue um mordedor para ele roer deitado na cama.',
          desinteresse: 'Mude a cama para um cômodo mais frequentado pela casa.'
        }
      },
      {
        id: '3-2',
        titulo: 'Micro-Ausências Positivas',
        descricao: 'Pratique sair do cômodo por 30 segundos deixando um brinquedo recheável.',
        objetivoPet: 'Previne latidos compulsivos e ansiedade de separação.',
        icone: 'door-closed',
        status: 'bloqueado',
        tipo: 'licao',
        xp: 40,
        offsetX: -45,
        passoAPasso: [
          'Entregue um mordedor com ração úmida para o pet.',
          'Vá para outro cômodo, feche a porta por 30 segundos e retorne sem fazer festa exagerada.',
          'Aumente o tempo gradualmente para 2 e 5 minutos conforme o pet permanecer calmo.'
        ],
        dicasCorrecao: {
          excelente: 'Ele continuou entretido com a recompensa sem sofrer com a sua ausência!',
          medo: 'O pet choramingou na porta. Dica: Reduza o tempo para 10 segundos e não faça despedidas longas.',
          agitado: 'O pet pulou na porta. Dica: Só retorne para o cômodo no momento em que ele estiver em silêncio.',
          desinteresse: 'Ele ignorou o brinquedo e seguiu você. Dica: Use um recheio mais irresistível (ex: pasta de amendoim pet).'
        }
      },
      {
        id: '3-3',
        titulo: 'Habituação a Sons Urbanos',
        descricao: 'Apresente ruídos de trânsito, trovões ou fogos em volume baixo.',
        objetivoPet: 'Previne fobias acústicas e reatividade a barulhos externos.',
        icone: 'volume-high',
        status: 'bloqueado',
        tipo: 'licao',
        xp: 45,
        offsetX: 40,
        passoAPasso: [
          'Toque no celular um áudio de trovão ou trânsito no volume mínimo.',
          'Inicie uma sessão de brincadeira ou entregue uma refeição com o som de fundo.',
          'Aumente ligeiramente o volume a cada 2 dias apenas se o pet continuar calmo.'
        ],
        dicasCorrecao: {
          excelente: 'O pet nem percebeu o som! A dessensibilização acústica foi um sucesso.',
          medo: 'O pet ergueu as orelhas em alerta. Dica: Reduza o volume imediatamente para o nível imperceptível.',
          agitado: 'O pet latiu para o celular. Dica: Distraia-o com uma brincadeira de farejar petiscos no chão.',
          desinteresse: 'O pet dormiu. Excelente sinal de adaptação ao som ambiente.'
        }
      },
      {
        id: '3-4',
        titulo: 'Mente Equilibrada & Confiante',
        descricao: 'Consagração do pet como um animal calmo, seguro e plenamente adaptado.',
        objetivoPet: 'Harmonia completa e saúde preventiva na convivência com a família.',
        icone: 'trophy-award',
        status: 'bloqueado',
        tipo: 'estrela',
        xp: 120,
        offsetX: 0,
        passoAPasso: ['Você completou todas as trilhas educacionais do PetGuardian!'],
        dicasCorrecao: {
          excelente: 'Parabéns à família e ao pet por essa jornada transformadora!',
          medo: 'Mantenha os treinos de apoio sempre que surgirem novos desafios.',
          agitado: 'Siga com a rotina de passeios e enriquecimento.',
          desinteresse: 'Celebre a grande evolução da matilha!'
        }
      }
    ]
  }
];

// Percorre o catálogo em ordem e marca cada passo como concluído/atual/bloqueado
// com base no que realmente existe no backend — mesma regra sequencial que
// antes vivia em desbloquearProximoPasso, só que agora sem estado local.
const construirSecoesComProgresso = (etapasConcluidasIds: Set<string>): SecaoTrilha[] => {
  const secoes: SecaoTrilha[] = JSON.parse(JSON.stringify(SECOES_CATALOGO));
  let desbloquearProxima = true;

  for (const secao of secoes) {
    for (const passo of secao.passos) {
      if (etapasConcluidasIds.has(passo.id)) {
        passo.status = 'concluido';
        desbloquearProxima = true;
      } else if (desbloquearProxima) {
        passo.status = 'atual';
        desbloquearProxima = false;
      } else {
        passo.status = 'bloqueado';
      }
    }
  }

  return secoes;
};

const showAlert = (title: string, message: string) => {
  if (Platform.OS === 'web') {
    window.alert(`${title}\n${message}`);
  } else {
    Alert.alert(title, message);
  }
};

const extrairMensagemErro = (error: any): string => {
  if (error.response?.data) {
    const data = error.response.data;
    if (typeof data === 'string') return data;
    if (data.message) return data.message;
    if (data.mensagem) return data.mensagem;
  }
  return error.message || 'Não foi possível registrar o progresso.';
};

export default function TrilhasDuolingoScreen() {
  const { pets, isLoading: carregandoPets } = usePets();
  const temPet = (pets?.length ?? 0) > 0;

  const { isLoading, etapasConcluidasIds, concluirEtapa, concluindoEtapa } = useTrilhas(temPet);
  const [etapaModal, setEtapaModal] = useState<PassoTrilha | null>(null);

  const secoes = useMemo(
    () => construirSecoesComProgresso(etapasConcluidasIds),
    [etapasConcluidasIds]
  );

  const handleAbrirEtapa = async (secaoId: string, etapa: PassoTrilha) => {
    if (etapa.status === 'bloqueado' || concluindoEtapa) return;

    // Baú ou estrela: concede XP direto, sem lição prática
    if (etapa.tipo === 'bau' || etapa.tipo === 'estrela') {
      if (etapa.status === 'concluido') {
        const msg = `🏆 ${etapa.titulo}\nVocê já resgatou esta conquista anteriormente! (0 XP)`;
        showAlert('Conquista Já Resgatada', msg);
        return;
      }

      try {
        await concluirEtapa({ etapaId: etapa.id, tipo: etapa.tipo, xp: etapa.xp });
        const msg = `🏆 ${etapa.titulo}\n${etapa.descricao}\n\n+${etapa.xp} XP de vitalidade concedidos!`;
        showAlert('Recompensa Desbloqueada!', msg);
      } catch (error: any) {
        showAlert('Erro na API', extrairMensagemErro(error));
      }
      return;
    }

    // Lições normais (abre o modal em modo normal ou modo revisão)
    setEtapaModal(etapa);
  };

  const handleConcluirLicao = async (xpGanho: number) => {
    if (!etapaModal) return;

    const jaEstavaConcluido = etapaModal.status === 'concluido';

    try {
      await concluirEtapa({ etapaId: etapaModal.id, tipo: etapaModal.tipo, xp: etapaModal.xp });

      if (!jaEstavaConcluido) {
        showAlert('🎉 Parabéns!', `Prática registrada com sucesso!\n+${xpGanho} XP adicionados ao bem-estar do pet.`);
      } else {
        showAlert('📖 Revisão Concluída', 'Revisão do treino realizada com sucesso!\nNenhum XP adicional foi gerado neste modo.');
      }
    } catch (error: any) {
      showAlert('Erro na API', extrairMensagemErro(error));
    }

    setEtapaModal(null);
  };

  if (carregandoPets || isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0066FF" />
        <Text style={styles.loadingText}>Carregando trilhas...</Text>
      </View>
    );
  }

  if (!temPet) {
    return (
      <View style={styles.container}>
        <View style={{ paddingHorizontal: 20, paddingTop: 10, paddingBottom: 6 }}>
          <Header title="Trilhas do Pet" />
        </View>
        <View style={styles.emptyStateContainer}>
          <MaterialCommunityIcons name="paw-off" size={56} color="#CBD5E1" />
          <Text style={styles.emptyStateTitulo}>Nenhum pet cadastrado</Text>
          <Text style={styles.emptyStateTexto}>
            Cadastre um pet na aba "Pets" para desbloquear as Trilhas de Aprendizado!
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={{ paddingHorizontal: 20, paddingTop: 10, paddingBottom: 6 }}>
        <Header title="Trilhas do Pet" />
      </View>

      <ScrollView 
        contentContainerStyle={styles.scrollPath}
        showsVerticalScrollIndicator={false}
      >
        {secoes.map((secao, sIndex) => (
          <View key={secao.id} style={styles.sectionContainer}>
            
            <Animated.View 
              entering={FadeInDown.delay(sIndex * 120)}
              style={[
                styles.unitBanner,
                { backgroundColor: secao.corTema, borderColor: secao.corBorda }
              ]}
            >
              <View style={{ flex: 1 }}>
                <Text style={styles.unitSub}>{secao.subtitulo}</Text>
                <Text style={styles.unitTitle}>{secao.titulo}</Text>
              </View>
              <View style={styles.guidebookButton}>
                <MaterialCommunityIcons name="book-open-page-variant" size={24} color="#FFF" />
              </View>
            </Animated.View>

            <View style={styles.nodesList}>
              {secao.passos.map((etapa, index) => {
                const ehConcluido = etapa.status === 'concluido';
                const ehAtual = etapa.status === 'atual';
                const ehBloqueado = etapa.status === 'bloqueado';

                let corPrincipal = secao.corTema;
                let corBorda3D = secao.corBorda;

                if (etapa.tipo === 'bau') {
                  corPrincipal = '#FFC800';
                  corBorda3D = '#E5A400';
                } else if (etapa.tipo === 'estrela') {
                  corPrincipal = '#F59E0B';
                  corBorda3D = '#D97706';
                }

                if (ehBloqueado) {
                  corPrincipal = '#E2E8F0';
                  corBorda3D = '#CBD5E1';
                }

                return (
                  <Animated.View 
                    key={etapa.id} 
                    entering={FadeInDown.delay(index * 60)}
                    style={[
                      styles.nodeWrapper, 
                      { transform: [{ translateX: etapa.offsetX }] }
                    ]}
                  >
                    {ehAtual && (
                      <View style={styles.activeFloatingBadge}>
                        <Text style={[styles.activeFloatingText, { color: secao.corTema }]}>COMEÇAR</Text>
                        <View style={styles.badgeArrow} />
                      </View>
                    )}

                    <TouchableOpacity
                      activeOpacity={ehBloqueado ? 1 : 0.75}
                      onPress={() => handleAbrirEtapa(secao.id, etapa)}
                      style={[
                        styles.nodeButton,
                        { 
                          backgroundColor: corPrincipal, 
                          borderColor: corBorda3D,
                          borderBottomWidth: ehBloqueado ? 5 : 7 
                        }
                      ]}
                    >
                      <MaterialCommunityIcons 
                        name={ehBloqueado ? 'lock' : etapa.icone} 
                        size={etapa.tipo === 'bau' ? 32 : 28} 
                        color={ehBloqueado ? '#94A3B8' : '#FFF'} 
                      />

                      {ehConcluido && etapa.tipo !== 'bau' && (
                        <View style={styles.starsWrapper}>
                          <MaterialCommunityIcons name="star" size={12} color="#FFC800" />
                          <MaterialCommunityIcons name="star" size={14} color="#FFC800" />
                          <MaterialCommunityIcons name="star" size={12} color="#FFC800" />
                        </View>
                      )}
                    </TouchableOpacity>
                  </Animated.View>
                );
              })}
            </View>

          </View>
        ))}
      </ScrollView>

      {etapaModal && (
        <LicaoPraticaModal
          visible={Boolean(etapaModal)}
          onClose={() => setEtapaModal(null)}
          onConcluir={handleConcluirLicao}
          titulo={etapaModal.titulo}
          icone={etapaModal.icone}
          passoAPasso={etapaModal.passoAPasso}
          dicasCorrecao={etapaModal.dicasCorrecao}
          xp={etapaModal.status === 'concluido' ? 0 : etapaModal.xp}
          ehRevisao={etapaModal.status === 'concluido'}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    paddingTop: Platform.OS === 'ios' ? 50 : 30,
  },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#FFFFFF' },
  loadingText: { marginTop: 12, fontSize: 15, color: '#64748B', fontWeight: '500' },
  emptyStateContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
    gap: 10,
  },
  emptyStateTitulo: {
    fontSize: 17,
    fontWeight: '800',
    color: '#334155',
  },
  emptyStateTexto: {
    fontSize: 14,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 20,
  },
  scrollPath: {
    paddingBottom: 140,
    gap: 16,
  },
  sectionContainer: {
    width: '100%',
    alignItems: 'center',
  },
  unitBanner: {
    width: '92%',
    maxWidth: 440,
    borderRadius: 18,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 5,
    marginBottom: 24,
    elevation: 3,
  },
  unitSub: {
    fontSize: 11,
    fontWeight: '900',
    color: 'rgba(255, 255, 255, 0.85)',
    letterSpacing: 0.8,
  },
  unitTitle: {
    fontSize: 17,
    fontWeight: '900',
    color: '#FFF',
    marginTop: 2,
  },
  guidebookButton: {
    width: 42,
    height: 42,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  nodesList: {
    alignItems: 'center',
    gap: 26,
    width: '100%',
    marginBottom: 20,
  },
  nodeWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  nodeButton: {
    width: 78,
    height: 78,
    borderRadius: 39,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 3,
  },
  activeFloatingBadge: {
    position: 'absolute',
    top: -36,
    backgroundColor: '#FFF',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#E2E8F0',
    elevation: 4,
    alignItems: 'center',
    zIndex: 10,
  },
  activeFloatingText: {
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  badgeArrow: {
    position: 'absolute',
    bottom: -6,
    width: 10,
    height: 10,
    backgroundColor: '#FFF',
    borderRightWidth: 2,
    borderBottomWidth: 2,
    borderColor: '#E2E8F0',
    transform: [{ rotate: '45deg' }],
  },
  starsWrapper: {
    position: 'absolute',
    bottom: -10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 1,
    backgroundColor: '#FFF',
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: '#F1F5F9',
  }
});