import React, { useState, useCallback, useMemo } from "react";
import { StatusBar } from "expo-status-bar";
import { 
  Text, 
  View, 
  Image, 
  StyleSheet, 
  ScrollView, 
  Platform, 
  ActivityIndicator, 
  TouchableOpacity, 
  TextInput, 
  KeyboardAvoidingView, 
  Alert,
  Modal
} from "react-native";
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Header } from "../../components/Header";
import { StreakCard } from "../../components/streakCard";
import { EmptyState } from "../../components/EmptyState";
import { TipCard } from "../../components/TipCard";
import { TaskItem } from "../../components/TaskItem";
import { HighlightTaskCard } from "../../components/HighlightTaskCard";
import { HealthHistoryCard } from "../../components/HealthHistoryCard";
import { getAvatarById, AVATARES_DISPONIVEIS } from '../../constants/Avatares';
import { useHome } from "../../hooks/useHome";
import { usePets, usePetsFamilia } from "../../hooks/usePets";
import { useFamily } from "../../hooks/useFamily";
import { TarefaBackend } from "../../hooks/useTarefas";

const showAlert = (title: string, message: string) => {
  if (Platform.OS === 'web') {
    window.alert(`${title}\n${message}`);
  } else {
    Alert.alert(title, message);
  }
};

// Formata dígitos digitados livremente em AAAA-MM-DD
const formatarDataDigitada = (texto: string): string => {
  const digits = texto.replace(/\D/g, '').slice(0, 8);
  if (digits.length <= 4) return digits;
  if (digits.length <= 6) return `${digits.slice(0, 4)}-${digits.slice(4)}`;
  return `${digits.slice(0, 4)}-${digits.slice(4, 6)}-${digits.slice(6)}`;
};

// Formata dígitos digitados livremente em HH:MM
const formatarHorarioDigitado = (texto: string): string => {
  const digits = texto.replace(/\D/g, '').slice(0, 4);
  if (digits.length <= 2) return digits;
  return `${digits.slice(0, 2)}:${digits.slice(2)}`;
};

const DIAS_SEMANA = [
  { label: 'D', valor: 'SUNDAY' },
  { label: 'S', valor: 'MONDAY' },
  { label: 'T', valor: 'TUESDAY' },
  { label: 'Q', valor: 'WEDNESDAY' },
  { label: 'Q', valor: 'THURSDAY' },
  { label: 'S', valor: 'FRIDAY' },
  { label: 'S', valor: 'SATURDAY' },
];

const extrairMensagemErro = (error: any): string => {
  if (error.response?.data) {
    const data = error.response.data;
    if (typeof data === 'string') return data;
    if (data.message) return data.message;
    if (data.mensagem) return data.mensagem;
    if (Array.isArray(data.errors)) {
      return data.errors.map((e: any) => e.defaultMessage || e.message || `${e.field}: inválido`).join('\n');
    }
    if (data.error) return data.error;
  }
  return error.message || 'Erro na requisição.';
};

export default function HomeScreen({ navigation }: any) {
  const [formVisivel, setFormVisivel] = useState(false);
  const [tarefaEmEdicao, setTarefaEmEdicao] = useState<TarefaBackend | null>(null);
  const [modalHistoricoVisivel, setModalHistoricoVisivel] = useState(false);
  const [proximasExpandido, setProximasExpandido] = useState(false);
  const [titulo, setTitulo] = useState('');
  const [descricao, setDescricao] = useState('');

  // Estados da recorrência (só usados na criação, não na edição)
  const [repetirTarefa, setRepetirTarefa] = useState(false);
  const [diasSelecionados, setDiasSelecionados] = useState<string[]>([]);
  const [horarioRecorrencia, setHorarioRecorrencia] = useState('08:00');
  const [dataFimRecorrencia, setDataFimRecorrencia] = useState('');

  const { 
    loading: loadingHome, 
    temFamilia, 
    xpTotal, 
    ofensivaTotal, 
    householdName, 
    petsDaFamilia, 
    tarefas, 
    tarefasPorDia,
    tarefasProximas,
    totalTarefasProximas,
    tarefasExpiradas,
    todasTarefas,
    historicoConcluidas,
    diasOfensiva, 
    handleCriarTarefa, 
    handleCriarTarefaRecorrente,
    handleAtualizarTarefa,
    alternarTarefaStatus, 
    handleExcluirTarefa,
    proximaTarefaPendente,
    criandoTarefa
  } = useHome();

  const { pets: petsProprios, isLoading: loadingPetsProprios } = usePets();
  const { pets: petsMatilha, isLoading: loadingPetsMatilha } = usePetsFamilia();
  const { familia } = useFamily();
  const souDono = Boolean(familia?.souDono);

  // Agrupa as ocorrências futuras (tarefasProximas) por título
  const repeticoesAtivas = useMemo(() => {
    const mapa = new Map<string, { titulo: string; ids: number[] }>();
    tarefasProximas.forEach((grupo) => {
      grupo.tarefas.forEach((t) => {
        if (!mapa.has(t.titulo)) {
          mapa.set(t.titulo, { titulo: t.titulo, ids: [] });
        }
        mapa.get(t.titulo)!.ids.push(t.id);
      });
    });
    return Array.from(mapa.values());
  }, [tarefasProximas]);

  // Unifica todos os pets da família e do usuário
  const listaPetsAtualizada = useMemo(() => {
    const mapaPets = new Map<number, any>();
    
    (petsMatilha || []).forEach((p: any) => {
      if (p?.id) mapaPets.set(Number(p.id), p);
    });
    (petsDaFamilia || []).forEach((p: any) => {
      if (p?.id) mapaPets.set(Number(p.id), p);
    });
    (petsProprios || []).forEach((p: any) => {
      if (p?.id) mapaPets.set(Number(p.id), p);
    });

    return Array.from(mapaPets.values());
  }, [petsMatilha, petsDaFamilia, petsProprios]);

  // XP do usuário logado (tarefas + trilhas via useHome)
  const meuXpReal = xpTotal ?? 0;

  // Sincroniza em tempo real o XP da família usando o maior valor conhecido como piso
  const xpFamiliaCalculado = useMemo(() => {
    const xpBaseFamilia = Number(familia?.xpTotal) || 0;
    const xpTarefasConcluidas = (todasTarefas || [])
      .filter((t: any) => t.concluida || t.status === 'CONCLUIDO')
      .reduce((acc: number, t: any) => acc + (Number(t.pontosTarefa) || Number(t.xp) || 15), 0);

    return Math.max(xpBaseFamilia, xpTarefasConcluidas, meuXpReal);
  }, [familia?.xpTotal, todasTarefas, meuXpReal]);

  const loading = loadingHome || loadingPetsProprios || loadingPetsMatilha;

  const handleNavigateToFamily = useCallback(() => {
    navigation.navigate('Family');
  }, [navigation]);

  const handleNavigateToMeuPet = useCallback(() => {
    navigation.navigate('MeuPet');
  }, [navigation]);

  const handleAbrirCriacao = useCallback(() => {
    setTarefaEmEdicao(null);
    setTitulo('');
    setDescricao('');
    setRepetirTarefa(false);
    setDiasSelecionados([]);
    setHorarioRecorrencia('08:00');
    setDataFimRecorrencia('');
    setFormVisivel(true);
  }, []);

  const handleAbrirEdicao = useCallback((id: number) => {
    const tarefaAlvo = todasTarefas.find(t => t.id === id);
    if (tarefaAlvo) {
      setTarefaEmEdicao(tarefaAlvo);
      setTitulo(tarefaAlvo.titulo);
      setDescricao(tarefaAlvo.descricao || '');
      setModalHistoricoVisivel(false);
      setFormVisivel(true);
    }
  }, [todasTarefas]);

  const handleFecharForm = useCallback(() => {
    setFormVisivel(false);
    setTarefaEmEdicao(null);
    setTitulo('');
    setDescricao('');
    setRepetirTarefa(false);
    setDiasSelecionados([]);
    setHorarioRecorrencia('08:00');
    setDataFimRecorrencia('');
  }, []);

  const alternarDiaSemana = useCallback((valor: string) => {
    setDiasSelecionados((prev) =>
      prev.includes(valor) ? prev.filter((d) => d !== valor) : [...prev, valor]
    );
  }, []);

  const salvarTarefa = useCallback(async () => {
    if (!titulo.trim() || !descricao.trim()) {
      showAlert("Campos vazios", "Informe o título e a descrição da tarefa para salvar!");
      return;
    }

    const petId = listaPetsAtualizada?.[0]?.id;
    if (!petId) {
      showAlert("Atenção", "Cadastre um pet antes de adicionar tarefas!");
      return;
    }

    // Fluxo de tarefa recorrente (só na criação)
    if (!tarefaEmEdicao && repetirTarefa) {
      if (diasSelecionados.length === 0) {
        showAlert("Atenção", "Selecione ao menos um dia da semana para repetir a tarefa!");
        return;
      }
      if (!dataFimRecorrencia.trim()) {
        showAlert("Atenção", "Informe até quando a tarefa deve se repetir!");
        return;
      }

      try {
        await handleCriarTarefaRecorrente(
          titulo,
          descricao,
          petId,
          diasSelecionados,
          horarioRecorrencia,
          dataFimRecorrencia
        );
        showAlert("Sucesso!", "Tarefa recorrente cadastrada com sucesso!");
        handleFecharForm();
      } catch (error: any) {
        const msg = extrairMensagemErro(error);
        showAlert("Erro na API", msg);
      }
      return;
    }
    
    try {
      if (tarefaEmEdicao) {
        await handleAtualizarTarefa(
          tarefaEmEdicao.id, 
          titulo, 
          descricao, 
          petId, 
          tarefaEmEdicao.expirada ? 'PENDENTE' : (tarefaEmEdicao.status || 'PENDENTE')
        );
        showAlert("Sucesso!", "Tarefa atualizada com sucesso!");
      } else {
        await handleCriarTarefa(titulo, descricao, petId);
        showAlert("Sucesso!", "Tarefa cadastrada com sucesso!");
      }
      handleFecharForm();
    } catch (error: any) {
      const msg = extrairMensagemErro(error);
      showAlert("Erro na API", msg);
    }
  }, [
    titulo, descricao, listaPetsAtualizada, tarefaEmEdicao,
    repetirTarefa, diasSelecionados, horarioRecorrencia, dataFimRecorrencia,
    handleCriarTarefa, handleCriarTarefaRecorrente, handleAtualizarTarefa, handleFecharForm
  ]);

  const confirmarExclusaoTarefa = useCallback((id: number, nomeTarefa: string) => {
    if (!souDono) {
      showAlert("Ação Não Permitida", "Apenas o responsável pela família pode excluir tarefas.");
      return;
    }

    const executarExclusao = async () => {
      try {
        await handleExcluirTarefa(id);
        showAlert("Sucesso", `Tarefa "${nomeTarefa}" excluída.`);
      } catch (error: any) {
        const msg = extrairMensagemErro(error);
        showAlert("Ação Não Permitida", msg);
      }
    };

    if (Platform.OS === 'web') {
      const confirmou = window.confirm(`Deseja remover a tarefa "${nomeTarefa}"?`);
      if (confirmou) executarExclusao();
    } else {
      Alert.alert(
        "Excluir Tarefa",
        `Deseja remover permanentemente a tarefa "${nomeTarefa}"?`,
        [
          { text: "Cancelar", style: "cancel" },
          { text: "Excluir", style: "destructive", onPress: executarExclusao }
        ]
      );
    }
  }, [souDono, handleExcluirTarefa]);

  const pararRepeticao = useCallback((tituloRepeticao: string, ids: number[]) => {
    if (!souDono) {
      showAlert("Ação Não Permitida", "Apenas o responsável pela família pode parar uma repetição.");
      return;
    }

    const executarParada = async () => {
      try {
        for (const id of ids) {
          await handleExcluirTarefa(id);
        }
        showAlert("Repetição parada", `As próximas ocorrências de "${tituloRepeticao}" foram removidas.`);
      } catch (error: any) {
        const msg = extrairMensagemErro(error);
        showAlert("Erro", msg);
      }
    };

    const mensagem = `Isso remove as ${ids.length} próxima${ids.length === 1 ? '' : 's'} ocorrência${ids.length === 1 ? '' : 's'} de "${tituloRepeticao}" que ainda não foram feitas. Dias já concluídos não são afetados.`;

    if (Platform.OS === 'web') {
      const confirmou = window.confirm(`Parar de repetir "${tituloRepeticao}"?\n${mensagem}`);
      if (confirmou) executarParada();
    } else {
      Alert.alert(
        "Parar Repetição",
        mensagem,
        [
          { text: "Cancelar", style: "cancel" },
          { text: "Parar Repetição", style: "destructive", onPress: executarParada }
        ]
      );
    }
  }, [souDono, handleExcluirTarefa]);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0066FF" />
        <Text style={styles.loadingText}>Sincronizando com o servidor...</Text>
      </View>
    );
  }

  if (!temFamilia) {
    return (
      <View style={styles.container}>
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
          <Header title="Home" />
          <EmptyState 
            iconName="home-group"
            iconColor="#1CB0F6"
            title="Bem-vindo ao PetGuardian!"
            description="Para ver e compartilhar a rotina dos pets, você precisa de uma Família."
            buttonText="Criar ou Entrar numa Família"
            onButtonPress={handleNavigateToFamily}
          />
        </ScrollView>
        <StatusBar style="dark" />
      </View>
    );
  }

  if (temFamilia && listaPetsAtualizada.length === 0) {
    return (
      <View style={styles.container}>
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
          <Header title="Home" />
          <EmptyState 
            iconName="dog"
            iconColor="#FF9600"
            title="Família Pronta!"
            description="Cadastre o seu primeiro pet para liberar o painel de tarefas!"
            buttonText="Cadastrar meu Pet"
            buttonColor="#FF9600"
            onButtonPress={handleNavigateToMeuPet}
          />
        </ScrollView>
        <StatusBar style="dark" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        <Header title="Home" />
        
        {/* Resumo com Todos os Pets da Família */}
        <View style={styles.petProfileContainer}>
          <View style={styles.FamiliaAvatars}>
            {listaPetsAtualizada.map((pet: any, index: number) => {
              const avatarKey = pet.avatarId ? String(pet.avatarId) : '1';
              const imagemCerta = getAvatarById(avatarKey) || AVATARES_DISPONIVEIS[0].imagem;
              return (
                <View 
                  key={pet.id ?? index.toString()} 
                  style={[
                    styles.avatarWrapper, 
                    index > 0 && { marginLeft: -22 },
                    { zIndex: 30 - index }
                  ]}
                >
                  <Image source={imagemCerta} style={styles.avatarImageFamilia} resizeMode="cover" />
                </View>
              );
            })}
          </View>

          <View style={styles.petInfoContainer}>
            <Text style={styles.petName} numberOfLines={1}>{householdName || 'Nossa Família'}</Text>
            
            {/* Linha de XP: Usuário e Família */}
            <View style={styles.xpRowContainer}>
              <View style={styles.xpItem}>
                <MaterialCommunityIcons name="star-face" size={16} color="#1CB0F6" />
                <Text style={styles.xpTextUser}>Seu XP: <Text style={styles.xpValorUser}>{meuXpReal} XP</Text></Text>
              </View>

              <Text style={styles.xpDivider}>|</Text>

              <View style={styles.xpItem}>
                <MaterialCommunityIcons name="trophy-outline" size={16} color="#F59E0B" />
                <Text style={styles.xpTextFamily}>Família: <Text style={styles.xpValorFamily}>{xpFamiliaCalculado} XP</Text></Text>
              </View>
            </View>
          </View>
        </View>

        {/* Ofensiva Semanal */}
        <StreakCard streakDays={diasOfensiva} totalStreak={ofensivaTotal} />

        {/* Botão de Criação de Tarefas */}
        <TouchableOpacity 
          style={styles.btnCriar} 
          onPress={handleAbrirCriacao}
          activeOpacity={0.8}
        >
          <MaterialCommunityIcons name="plus-circle" size={24} color="#FFF" />
          <Text style={styles.btnCriarText}>Nova Tarefa do Dia</Text>
        </TouchableOpacity>

        {/* Tarefa em Destaque */}
        <HighlightTaskCard 
          tarefa={proximaTarefaPendente as any}
          onComplete={alternarTarefaStatus}
          totalTarefasHoje={tarefas.length}
        />

        {/* Tarefas agrupadas por dia */}
        {tarefasPorDia.length === 0 ? (
          <View style={styles.tasksContainer}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Tarefas</Text>
            </View>
            <View style={styles.emptyTasks}>
              <MaterialCommunityIcons name="clipboard-text-outline" size={40} color="#CBD5E1" />
              <Text style={styles.emptyTasksText}>Nenhuma tarefa cadastrada ainda.</Text>
              <Text style={styles.emptyTasksSubtext}>Adicione tarefas no botão acima!</Text>
            </View>
          </View>
        ) : (
          tarefasPorDia.map((grupo) => {
            const concluidasNoGrupo = grupo.tarefas.filter(t => t.concluida || t.status === 'CONCLUIDO').length;
            return (
              <View key={grupo.dataIso} style={styles.tasksContainer}>
                <View style={styles.sectionHeader}>
                  <Text style={styles.sectionTitle}>{grupo.label}</Text>
                  <Text style={styles.progressText}>{concluidasNoGrupo}/{grupo.tarefas.length}</Text>
                </View>

                {grupo.tarefas.map((t) => (
                  <TaskItem 
                    key={t.id}
                    id={t.id}
                    title={t.titulo}
                    time={grupo.label}
                    xp={t.pontosTarefa || t.xp || 15}
                    isDone={Boolean(t.concluida || t.status === 'CONCLUIDO')}
                    onToggle={alternarTarefaStatus}
                    onEdit={() => handleAbrirEdicao(t.id)}
                    onDelete={souDono ? () => confirmarExclusaoTarefa(t.id, t.titulo) : undefined}
                  />
                ))}
              </View>
            );
          })
        )}

        {/* Repetições ativas */}
        {repeticoesAtivas.length > 0 && (
          <View style={styles.tasksContainer}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Repetições ativas</Text>
            </View>

            {repeticoesAtivas.map((rep) => (
              <View key={rep.titulo} style={styles.repeticaoCard}>
                <View style={styles.repeticaoInfo}>
                  <View style={styles.repeticaoIconWrapper}>
                    <MaterialCommunityIcons name="repeat" size={18} color="#0066FF" />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.repeticaoTitulo} numberOfLines={1}>{rep.titulo}</Text>
                    <Text style={styles.repeticaoSubtitulo}>
                      {rep.ids.length} {rep.ids.length === 1 ? 'ocorrência agendada' : 'ocorrências agendadas'}
                    </Text>
                  </View>
                </View>

                {souDono && (
                  <TouchableOpacity
                    style={styles.btnPararRepeticao}
                    onPress={() => pararRepeticao(rep.titulo, rep.ids)}
                    activeOpacity={0.7}
                  >
                    <MaterialCommunityIcons name="stop-circle-outline" size={16} color="#EF4444" />
                    <Text style={styles.btnPararRepeticaoText}>Parar repetição</Text>
                  </TouchableOpacity>
                )}
              </View>
            ))}
          </View>
        )}

        {/* Próximas tarefas */}
        {totalTarefasProximas > 0 && (
          <View style={styles.tasksContainer}>
            <TouchableOpacity
              style={styles.proximasHeaderCard}
              onPress={() => setProximasExpandido((prev) => !prev)}
              activeOpacity={0.8}
            >
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                <View style={styles.proximasIconWrapper}>
                  <MaterialCommunityIcons name="calendar-clock-outline" size={20} color="#0066FF" />
                </View>
                <View>
                  <Text style={styles.proximasTitle}>Próximas tarefas</Text>
                  <Text style={styles.proximasSubtitle}>
                    {totalTarefasProximas} {totalTarefasProximas === 1 ? 'tarefa agendada' : 'tarefas agendadas'}
                  </Text>
                </View>
              </View>
              <MaterialCommunityIcons 
                name={proximasExpandido ? 'chevron-up' : 'chevron-down'} 
                size={24} 
                color="#94A3B8" 
              />
            </TouchableOpacity>

            {proximasExpandido && (
              <View style={{ gap: 12, marginTop: 4 }}>
                {tarefasProximas.map((grupo) => (
                  <View key={grupo.dataIso} style={{ gap: 8 }}>
                    <View style={styles.sectionHeader}>
                      <Text style={styles.sectionTitleProxima}>{grupo.label}</Text>
                      <Text style={styles.progressTextProxima}>{grupo.tarefas.length}</Text>
                    </View>

                    {grupo.tarefas.map((t) => (
                      <TaskItem 
                        key={t.id}
                        id={t.id}
                        title={t.titulo}
                        time={grupo.label}
                        xp={t.pontosTarefa || t.xp || 15}
                        isDone={false}
                        onToggle={() => showAlert("Tarefa Futura", "Essa tarefa ainda não chegou no dia dela. Ela libera para conclusão a partir da data agendada.")}
                        onEdit={() => handleAbrirEdicao(t.id)}
                        onDelete={souDono ? () => confirmarExclusaoTarefa(t.id, t.titulo) : undefined}
                      />
                    ))}
                  </View>
                ))}
              </View>
            )}
          </View>
        )}

        {/* Tarefas Expiradas */}
        {tarefasExpiradas.length > 0 && (
          <View style={styles.tasksContainer}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitleExpirada}>Tarefas Expiradas</Text>
              <MaterialCommunityIcons name="clock-alert-outline" size={20} color="#F59E0B" />
            </View>

            {tarefasExpiradas.map((t) => (
              <View key={`exp-${t.id}`} style={styles.expiredItemCard}>
                <MaterialCommunityIcons name="clock-remove-outline" size={22} color="#F59E0B" />
                <View style={{ flex: 1, marginLeft: 12 }}>
                  <Text style={styles.expiredItemTitle}>{t.titulo}</Text>
                  <Text style={styles.expiredItemSubtitle}>
                    Prazo perdido em {t.prazo ? new Date(t.prazo).toLocaleDateString('pt-BR') : '—'}
                  </Text>
                </View>
                <View style={{ flexDirection: 'row', gap: 6 }}>
                  <TouchableOpacity 
                    onPress={() => handleAbrirEdicao(t.id)}
                    style={styles.btnEditHistory}
                    activeOpacity={0.7}
                  >
                    <MaterialCommunityIcons name="calendar-refresh-outline" size={18} color="#0066FF" />
                  </TouchableOpacity>
                  {souDono && (
                    <TouchableOpacity 
                      onPress={() => confirmarExclusaoTarefa(t.id, t.titulo)}
                      style={styles.btnDeleteHistory}
                      activeOpacity={0.7}
                    >
                      <MaterialCommunityIcons name="trash-can-outline" size={18} color="#EF4444" />
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            ))}
            <Text style={styles.expiredHint}>Edite uma tarefa expirada para renová-la com um novo prazo.</Text>
          </View>
        )}

        {/* Histórico de Concluídas */}
        {historicoConcluidas.length > 0 && (
          <TouchableOpacity 
            style={styles.historyAccessCard} 
            onPress={() => setModalHistoricoVisivel(true)}
            activeOpacity={0.8}
          >
            <View style={styles.historyAccessLeft}>
              <View style={styles.historyIconWrapper}>
                <MaterialCommunityIcons name="history" size={24} color="#0066FF" />
              </View>
              <View>
                <Text style={styles.historyAccessTitle}>Histórico de Concluídas</Text>
                <Text style={styles.historyAccessSubtitle}>
                  {historicoConcluidas.length} {historicoConcluidas.length === 1 ? 'tarefa realizada' : 'tarefas realizadas'}
                </Text>
              </View>
            </View>
            <MaterialCommunityIcons name="chevron-right" size={24} color="#94A3B8" />
          </TouchableOpacity>
        )}

        <TipCard text="Toque no lápis para editar, na lixeira para excluir ou no check para marcar." />

        {/* Histórico Clínico */}
        <HealthHistoryCard pets={listaPetsAtualizada} />
        
        <View style={{ height: 130 }} />
      </ScrollView>

      {/* Modal Dedicado de Histórico de Tarefas */}
      <Modal
        visible={modalHistoricoVisivel}
        transparent
        animationType="fade"
        onRequestClose={() => setModalHistoricoVisivel(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.historyModalContainer}>
            <View style={styles.historyModalHeader}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <MaterialCommunityIcons name="clipboard-check-outline" size={24} color="#10B981" />
                <Text style={styles.historyModalTitle}>Tarefas Concluídas</Text>
              </View>
              <TouchableOpacity 
                onPress={() => setModalHistoricoVisivel(false)}
                style={styles.btnCloseModal}
              >
                <MaterialCommunityIcons name="close" size={20} color="#64748B" />
              </TouchableOpacity>
            </View>

            <ScrollView 
              style={styles.historyScrollList} 
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{ gap: 10, paddingBottom: 15 }}
            >
              {historicoConcluidas.map((t) => (
                <View key={`hist-${t.id}`} style={styles.historyItemCard}>
                  <View style={styles.historyItemMain}>
                    <TouchableOpacity 
                      style={styles.reopenButton} 
                      onPress={() => alternarTarefaStatus(t.id)}
                      activeOpacity={0.7}
                    >
                      <MaterialCommunityIcons name="check-circle" size={22} color="#10B981" />
                    </TouchableOpacity>

                    <View style={{ flex: 1, gap: 2 }}>
                      <Text style={styles.historyItemTitle}>{t.titulo}</Text>
                      {t.descricao ? <Text style={styles.historyItemDesc}>{t.descricao}</Text> : null}
                      <Text style={styles.historyItemDate}>
                        Realizada • {t.prazo ? new Date(t.prazo).toLocaleDateString('pt-BR') : 'Hoje'}
                      </Text>
                    </View>

                    <View style={styles.historyItemRight}>
                      <Text style={styles.historyItemXp}>+{t.pontosTarefa || 15} XP</Text>
                      <View style={{ flexDirection: 'row', gap: 6, marginTop: 4 }}>
                        <TouchableOpacity 
                          onPress={() => handleAbrirEdicao(t.id)}
                          style={styles.btnEditHistory}
                          activeOpacity={0.7}
                        >
                          <MaterialCommunityIcons name="pencil-outline" size={18} color="#0066FF" />
                        </TouchableOpacity>
                        {souDono && (
                          <TouchableOpacity 
                            onPress={() => confirmarExclusaoTarefa(t.id, t.titulo)}
                            style={styles.btnDeleteHistory}
                            activeOpacity={0.7}
                          >
                            <MaterialCommunityIcons name="trash-can-outline" size={18} color="#EF4444" />
                          </TouchableOpacity>
                        )}
                      </View>
                    </View>
                  </View>
                </View>
              ))}
            </ScrollView>

            <TouchableOpacity 
              style={styles.btnFecharHistorico} 
              onPress={() => setModalHistoricoVisivel(false)}
            >
              <Text style={styles.btnFecharHistoricoText}>Fechar Histórico</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Modal de Criação / Edição de Tarefas */}
      {formVisivel && (
        <View style={styles.absoluteOverlay}>
          <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ width: '100%', maxWidth: 450, alignSelf: 'center' }}>
            <View style={styles.modalCard}>
              <View style={styles.modalTopBar}>
                <View style={styles.modalTitleWrapper}>
                  <View style={styles.modalIconBadge}>
                    <MaterialCommunityIcons
                      name={tarefaEmEdicao ? "pencil-outline" : "paw"}
                      size={18}
                      color="#0066FF"
                    />
                  </View>
                  <Text style={styles.modalHeader}>
                    {tarefaEmEdicao ? "Editar Tarefa" : "O que faremos hoje?"}
                  </Text>
                </View>
                <TouchableOpacity
                  onPress={handleFecharForm}
                  style={styles.btnCloseModal}
                  activeOpacity={0.7}
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                >
                  <MaterialCommunityIcons name="close" size={18} color="#64748B" />
                </TouchableOpacity>
              </View>

              <ScrollView contentContainerStyle={{ paddingBottom: 4 }} showsVerticalScrollIndicator={false}>
                {tarefaEmEdicao?.expirada && (
                  <View style={styles.avisoRenovacao}>
                    <MaterialCommunityIcons name="alert-circle-outline" size={16} color="#B45309" />
                    <Text style={styles.avisoRenovacaoText}>
                      Esta tarefa expirou. Salvar aqui vai renová-la com prazo até hoje.
                    </Text>
                  </View>
                )}

                <Text style={styles.fieldLabel}>Título</Text>
                <View style={styles.inputWrapper}>
                  <MaterialCommunityIcons name="clipboard-text-outline" size={18} color="#94A3B8" style={styles.inputIcon} />
                  <TextInput
                    style={styles.inputModal}
                    placeholder="Ex: Dar Ração da Tarde"
                    placeholderTextColor="#94A3B8"
                    maxLength={30}
                    value={titulo}
                    onChangeText={setTitulo}
                  />
                </View>

                <Text style={styles.fieldLabel}>Descrição</Text>
                <View style={styles.inputWrapper}>
                  <TextInput
                    style={[styles.inputModal, styles.inputMultiline]}
                    placeholder="Descrição detalhada..."
                    placeholderTextColor="#94A3B8"
                    maxLength={200}
                    multiline
                    value={descricao}
                    onChangeText={setDescricao}
                  />
                </View>

                {!tarefaEmEdicao && (
                  <>
                    <TouchableOpacity
                      style={[styles.toggleRepetirRow, repetirTarefa && styles.toggleRepetirRowAtivo]}
                      onPress={() => setRepetirTarefa(prev => !prev)}
                      activeOpacity={0.7}
                    >
                      <MaterialCommunityIcons
                        name={repetirTarefa ? "checkbox-marked" : "checkbox-blank-outline"}
                        size={22}
                        color={repetirTarefa ? "#0066FF" : "#94A3B8"}
                      />
                      <Text style={styles.toggleRepetirText}>Repetir tarefa em dias da semana</Text>
                    </TouchableOpacity>

                    {repetirTarefa && (
                      <View style={styles.recorrenciaContainer}>
                        <Text style={styles.recorrenciaLabel}>Dias da semana</Text>
                        <View style={styles.diasSemanaRow}>
                          {DIAS_SEMANA.map((d, idx) => {
                            const selecionado = diasSelecionados.includes(d.valor);
                            return (
                              <TouchableOpacity
                                key={`${d.valor}-${idx}`}
                                onPress={() => alternarDiaSemana(d.valor)}
                                style={[styles.diaChip, selecionado && styles.diaChipAtivo]}
                                activeOpacity={0.7}
                              >
                                <Text style={[styles.diaChipText, selecionado && styles.diaChipTextAtivo]}>
                                  {d.label}
                                </Text>
                              </TouchableOpacity>
                            );
                          })}
                        </View>

                        <View style={styles.recorrenciaRow}>
                          <View style={{ flex: 1 }}>
                            <Text style={styles.recorrenciaLabel}>Prazo (horário)</Text>
                            <View style={styles.inputWrapperSmall}>
                              <MaterialCommunityIcons name="clock-alert-outline" size={16} color="#94A3B8" style={styles.inputIcon} />
                              <TextInput
                                style={styles.inputModalSmall}
                                placeholder="HH:MM"
                                placeholderTextColor="#94A3B8"
                                value={horarioRecorrencia}
                                onChangeText={(texto) => setHorarioRecorrencia(formatarHorarioDigitado(texto))}
                                keyboardType="number-pad"
                                maxLength={5}
                              />
                            </View>
                          </View>

                          <View style={{ flex: 1.3 }}>
                            <Text style={styles.recorrenciaLabel}>Repetir até</Text>
                            <View style={styles.inputWrapperSmall}>
                              <MaterialCommunityIcons name="calendar-end-outline" size={16} color="#94A3B8" style={styles.inputIcon} />
                              <TextInput
                                style={styles.inputModalSmall}
                                placeholder="AAAA-MM-DD"
                                placeholderTextColor="#94A3B8"
                                value={dataFimRecorrencia}
                                onChangeText={(texto) => setDataFimRecorrencia(formatarDataDigitada(texto))}
                                keyboardType="number-pad"
                                maxLength={10}
                              />
                            </View>
                          </View>
                        </View>

                        <Text style={styles.recorrenciaHint}>
                          Esse é o horário-limite de conclusão em cada dia marcado — depois dele, a tarefa do dia expira. Vale até a data final informada.
                        </Text>
                      </View>
                    )}
                  </>
                )}

                <View style={styles.modalButtons}>
                  <TouchableOpacity style={styles.btnCancelar} onPress={handleFecharForm} activeOpacity={0.7}>
                    <Text style={styles.btnCancelarText}>Cancelar</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.btnSalvar, criandoTarefa && { opacity: 0.7 }]}
                    onPress={salvarTarefa}
                    disabled={criandoTarefa}
                    activeOpacity={0.85}
                  >
                    {criandoTarefa ? (
                      <ActivityIndicator color="#FFF" />
                    ) : (
                      <>
                        <MaterialCommunityIcons name="check-circle-outline" size={18} color="#FFF" />
                        <Text style={styles.btnSalvarText}>
                          {tarefaEmEdicao ? "Salvar Alterações" : "Salvar Tarefa"}
                        </Text>
                      </>
                    )}
                  </TouchableOpacity>
                </View>
              </ScrollView>
            </View>
          </KeyboardAvoidingView>
        </View>
      )}

      <StatusBar style="dark" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F4F7FA', paddingTop: Platform.OS === 'ios' ? 50 : 30 },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F4F7FA' },
  loadingText: { marginTop: 12, fontSize: 15, color: '#64748B', fontWeight: '500' },
  scrollContent: { padding: 24, gap: 20 },
  petProfileContainer: { flexDirection: 'row', alignItems: 'center', gap: 12, marginTop: 5, marginBottom: 10 },
  FamiliaAvatars: { flexDirection: 'row', alignItems: 'center', flexShrink: 0 },
  avatarWrapper: { borderRadius: 32, borderWidth: 2.5, borderColor: '#FFF', backgroundColor: '#FFF', elevation: 2 },
  avatarImageFamilia: { width: 56, height: 56, borderRadius: 28 },
  petInfoContainer: { flex: 1, justifyContent: 'center' },
  petName: { fontSize: 22, fontWeight: 'bold', color: '#1E293B', marginBottom: 2 },
  
  xpRowContainer: { flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', gap: 6, marginTop: 2 },
  xpItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  xpTextUser: { fontSize: 13, color: '#64748B', fontWeight: '600' },
  xpValorUser: { color: '#1CB0F6', fontWeight: '800' },
  xpDivider: { fontSize: 12, color: '#CBD5E1', marginHorizontal: 2 },
  xpTextFamily: { fontSize: 13, color: '#64748B', fontWeight: '600' },
  xpValorFamily: { color: '#D97706', fontWeight: '800' },

  tasksContainer: { gap: 12 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
  sectionTitle: { fontSize: 18, fontWeight: '700', color: '#1E293B' },
  sectionTitleExpirada: { fontSize: 18, fontWeight: '700', color: '#B45309' },
  sectionTitleProxima: { fontSize: 15, fontWeight: '700', color: '#475569' },
  progressText: { fontSize: 16, fontWeight: '600', color: '#1CB0F6' },
  progressTextProxima: { fontSize: 14, fontWeight: '600', color: '#94A3B8' },
  emptyTasks: { backgroundColor: '#FFF', borderRadius: 20, padding: 30, alignItems: 'center', borderWidth: 1, borderColor: '#E2E8F0', gap: 8 },
  emptyTasksText: { fontSize: 16, fontWeight: '600', color: '#94A3B8' },
  emptyTasksSubtext: { fontSize: 14, color: '#CBD5E1' },
  btnCriar: { backgroundColor: '#0066FF', flexDirection: 'row', padding: 16, borderRadius: 16, justifyContent: 'center', alignItems: 'center', gap: 10, elevation: 4 },
  btnCriarText: { color: '#FFF', fontWeight: 'bold', fontSize: 16 },

  proximasHeaderCard: { backgroundColor: '#FFF', borderRadius: 16, padding: 14, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderWidth: 1, borderColor: '#E2E8F0' },
  proximasIconWrapper: { width: 38, height: 38, borderRadius: 19, backgroundColor: '#EFF6FF', justifyContent: 'center', alignItems: 'center' },
  proximasTitle: { fontSize: 15, fontWeight: '700', color: '#1E293B' },
  proximasSubtitle: { fontSize: 12, color: '#64748B', marginTop: 1 },

  repeticaoCard: { backgroundColor: '#FFF', borderRadius: 16, padding: 14, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderWidth: 1, borderColor: '#E2E8F0', gap: 10 },
  repeticaoInfo: { flexDirection: 'row', alignItems: 'center', gap: 10, flex: 1 },
  repeticaoIconWrapper: { width: 34, height: 34, borderRadius: 17, backgroundColor: '#EFF6FF', justifyContent: 'center', alignItems: 'center' },
  repeticaoTitulo: { fontSize: 14, fontWeight: '700', color: '#1E293B' },
  repeticaoSubtitulo: { fontSize: 12, color: '#64748B', marginTop: 1 },
  btnPararRepeticao: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: '#FEE2E2', paddingVertical: 8, paddingHorizontal: 10, borderRadius: 10 },
  btnPararRepeticaoText: { fontSize: 12, fontWeight: '700', color: '#EF4444' },

  expiredItemCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFFBEB', borderRadius: 16, padding: 14, borderWidth: 1, borderColor: '#FDE68A' },
  expiredItemTitle: { fontSize: 15, fontWeight: '700', color: '#92400E' },
  expiredItemSubtitle: { fontSize: 12, color: '#B45309', marginTop: 2 },
  expiredHint: { fontSize: 12, color: '#94A3B8', textAlign: 'center', marginTop: 2 },

  historyAccessCard: { backgroundColor: '#FFF', borderRadius: 18, padding: 16, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderWidth: 1, borderColor: '#E2E8F0', elevation: 2 },
  historyAccessLeft: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  historyIconWrapper: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#EFF6FF', justifyContent: 'center', alignItems: 'center' },
  historyAccessTitle: { fontSize: 16, fontWeight: '700', color: '#1E293B' },
  historyAccessSubtitle: { fontSize: 13, color: '#64748B', marginTop: 2 },

  modalOverlay: { flex: 1, backgroundColor: 'rgba(15, 23, 42, 0.6)', justifyContent: 'center', alignItems: 'center', padding: 20 },
  historyModalContainer: { width: '100%', maxWidth: 460, maxHeight: '80%', backgroundColor: '#FFF', borderRadius: 24, padding: 20, elevation: 12 },
  historyModalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, paddingBottom: 12, borderBottomWidth: 1, borderBottomColor: '#F1F5F9' },
  historyModalTitle: { fontSize: 18, fontWeight: 'bold', color: '#1E293B' },
  historyScrollList: { marginVertical: 4 },
  historyItemCard: { backgroundColor: '#F8FAFC', padding: 14, borderRadius: 14, borderWidth: 1, borderColor: '#E2E8F0' },
  historyItemMain: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  reopenButton: { padding: 2 },
  historyItemTitle: { fontSize: 15, fontWeight: '700', color: '#334155', textDecorationLine: 'line-through' },
  historyItemDesc: { fontSize: 13, color: '#64748B' },
  historyItemDate: { fontSize: 12, color: '#94A3B8', marginTop: 2 },
  historyItemRight: { alignItems: 'flex-end', gap: 4 },
  historyItemXp: { fontSize: 13, fontWeight: 'bold', color: '#10B981' },
  btnEditHistory: { padding: 4, borderRadius: 6, backgroundColor: '#EFF6FF' },
  btnDeleteHistory: { padding: 4, borderRadius: 6, backgroundColor: '#FEE2E2' },
  btnFecharHistorico: { backgroundColor: '#F1F5F9', padding: 14, borderRadius: 14, alignItems: 'center', marginTop: 12 },
  btnFecharHistoricoText: { color: '#475569', fontWeight: 'bold', fontSize: 15 },

  absoluteOverlay: { position: 'absolute', top: 0, bottom: 0, left: 0, right: 0, backgroundColor: 'rgba(15, 23, 42, 0.55)', justifyContent: 'center', padding: 20, zIndex: 999, elevation: 10 },
  modalCard: {
    backgroundColor: '#FFF',
    borderRadius: 24,
    paddingHorizontal: 22,
    paddingTop: 18,
    paddingBottom: 20,
    elevation: 14,
    shadowColor: '#0F172A',
    shadowOpacity: 0.18,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 10 },
    maxHeight: '88%',
  },
  modalTopBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 18,
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  modalTitleWrapper: { flexDirection: 'row', alignItems: 'center', gap: 10, flexShrink: 1 },
  modalIconBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#EFF6FF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalHeader: { fontSize: 18, fontWeight: 'bold', color: '#134879', flexShrink: 1 },
  btnCloseModal: { padding: 6, borderRadius: 20, backgroundColor: '#F1F5F9' },

  avisoRenovacao: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    backgroundColor: '#FFFBEB',
    padding: 12,
    borderRadius: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#FDE68A',
  },
  avisoRenovacaoText: { flex: 1, fontSize: 13, color: '#92400E', lineHeight: 18 },

  fieldLabel: { fontSize: 12, fontWeight: '700', color: '#64748B', marginBottom: 6, marginTop: 2 },

  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 14,
    marginBottom: 16,
    paddingHorizontal: 12,
  },
  inputIcon: { marginRight: 8 },
  inputModal: { flex: 1, paddingVertical: 13, color: '#1E293B', fontSize: 14 },
  inputMultiline: { height: 80, textAlignVertical: 'top', paddingTop: 12 },

  toggleRepetirRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 12,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 14,
  },
  toggleRepetirRowAtivo: { backgroundColor: '#EFF6FF', borderColor: '#BFDBFE' },
  toggleRepetirText: { fontSize: 14, fontWeight: '600', color: '#334155' },

  recorrenciaContainer: { backgroundColor: '#F8FAFC', borderRadius: 14, padding: 14, marginBottom: 16, borderWidth: 1, borderColor: '#E2E8F0', gap: 4 },
  recorrenciaLabel: { fontSize: 12, fontWeight: '700', color: '#64748B', marginBottom: 6 },
  diasSemanaRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 16 },
  diaChip: { width: 34, height: 34, borderRadius: 17, justifyContent: 'center', alignItems: 'center', backgroundColor: '#E2E8F0' },
  diaChipAtivo: { backgroundColor: '#0066FF' },
  diaChipText: { fontSize: 13, fontWeight: 'bold', color: '#64748B' },
  diaChipTextAtivo: { color: '#FFF' },

  recorrenciaRow: { flexDirection: 'row', gap: 10, marginBottom: 10 },
  inputWrapperSmall: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    paddingHorizontal: 10,
  },
  inputModalSmall: { flex: 1, paddingVertical: 10, color: '#1E293B', fontSize: 13 },
  recorrenciaHint: { fontSize: 11.5, color: '#94A3B8', lineHeight: 16, marginTop: 2 },

  modalButtons: { flexDirection: 'row', gap: 10, marginTop: 6 },
  btnCancelar: { flex: 1, paddingVertical: 15, alignItems: 'center', borderRadius: 14, backgroundColor: '#EDF2F7' },
  btnCancelarText: { color: '#64748B', fontWeight: 'bold', fontSize: 14 },
  btnSalvar: {
    flex: 1,
    flexDirection: 'row',
    gap: 8,
    paddingVertical: 15,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 14,
    backgroundColor: '#0066FF',
    elevation: 3,
  },
  btnSalvarText: { color: '#FFF', fontWeight: 'bold', fontSize: 14 },
});