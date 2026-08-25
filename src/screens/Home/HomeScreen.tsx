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
  const [titulo, setTitulo] = useState('');
  const [descricao, setDescricao] = useState('');

  const { 
    loading: loadingHome, 
    temFamilia, 
    xpTotal, 
    ofensivaTotal, 
    householdName, 
    petsDaFamilia, 
    tarefas, 
    tarefasPorDia,
    tarefasExpiradas,
    todasTarefas,
    historicoConcluidas,
    diasOfensiva, 
    handleCriarTarefa, 
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
  }, [titulo, descricao, listaPetsAtualizada, tarefaEmEdicao, handleCriarTarefa, handleAtualizarTarefa, handleFecharForm]);

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
        
        {/* Resumo da Matilha com Todos os Pets da Família */}
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
            <Text style={styles.petStatus}>Você já tem {xpTotal} XP!</Text>
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

        {/* Tarefas agrupadas por dia (Hoje, Ontem, e datas anteriores) */}
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

        {/* Card de Acesso ao Histórico */}
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
            <View style={styles.modalContent}>
              <Text style={styles.modalHeader}>
                {tarefaEmEdicao ? "Editar Tarefa" : "O que faremos hoje?"}
              </Text>

              {tarefaEmEdicao?.expirada && (
                <Text style={styles.avisoRenovacao}>
                  Esta tarefa expirou. Salvar aqui vai renová-la com prazo até hoje.
                </Text>
              )}
              
              <TextInput 
                style={styles.inputModal} 
                placeholder="Título (Ex: Dar Ração da Tarde)" 
                maxLength={30} 
                value={titulo}
                onChangeText={setTitulo} 
              />

              <TextInput 
                style={[styles.inputModal, { height: 80, textAlignVertical: 'top' }]} 
                placeholder="Descrição detalhada..." 
                maxLength={200} 
                multiline
                value={descricao}
                onChangeText={setDescricao} 
              />

              <View style={styles.modalButtons}>
                <TouchableOpacity style={styles.btnCancelar} onPress={handleFecharForm}>
                  <Text style={{ color: '#64748B', fontWeight: 'bold' }}>Cancelar</Text>
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={[styles.btnSalvar, criandoTarefa && { opacity: 0.7 }]} 
                  onPress={salvarTarefa}
                  disabled={criandoTarefa}
                >
                  {criandoTarefa ? (
                    <ActivityIndicator color="#FFF" />
                  ) : (
                    <Text style={{ color: '#FFF', fontWeight: 'bold' }}>
                      {tarefaEmEdicao ? "Salvar Alterações" : "Salvar Tarefa"}
                    </Text>
                  )}
                </TouchableOpacity>
              </View>
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
  petStatus: { fontSize: 14, color: '#1CB0F6', fontWeight: '700' },
  tasksContainer: { gap: 12 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
  sectionTitle: { fontSize: 18, fontWeight: '700', color: '#1E293B' },
  sectionTitleExpirada: { fontSize: 18, fontWeight: '700', color: '#B45309' },
  progressText: { fontSize: 16, fontWeight: '600', color: '#1CB0F6' },
  emptyTasks: { backgroundColor: '#FFF', borderRadius: 20, padding: 30, alignItems: 'center', borderWidth: 1, borderColor: '#E2E8F0', gap: 8 },
  emptyTasksText: { fontSize: 16, fontWeight: '600', color: '#94A3B8' },
  emptyTasksSubtext: { fontSize: 14, color: '#CBD5E1' },
  btnCriar: { backgroundColor: '#0066FF', flexDirection: 'row', padding: 16, borderRadius: 16, justifyContent: 'center', alignItems: 'center', gap: 10, elevation: 4 },
  btnCriarText: { color: '#FFF', fontWeight: 'bold', fontSize: 16 },

  expiredItemCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFFBEB', borderRadius: 16, padding: 14, borderWidth: 1, borderColor: '#FDE68A' },
  expiredItemTitle: { fontSize: 15, fontWeight: '700', color: '#92400E' },
  expiredItemSubtitle: { fontSize: 12, color: '#B45309', marginTop: 2 },
  expiredHint: { fontSize: 12, color: '#94A3B8', textAlign: 'center', marginTop: 2 },
  avisoRenovacao: { fontSize: 13, color: '#B45309', backgroundColor: '#FFFBEB', padding: 10, borderRadius: 10, marginBottom: 14, borderWidth: 1, borderColor: '#FDE68A' },

  historyAccessCard: { backgroundColor: '#FFF', borderRadius: 18, padding: 16, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderWidth: 1, borderColor: '#E2E8F0', elevation: 2 },
  historyAccessLeft: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  historyIconWrapper: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#EFF6FF', justifyContent: 'center', alignItems: 'center' },
  historyAccessTitle: { fontSize: 16, fontWeight: '700', color: '#1E293B' },
  historyAccessSubtitle: { fontSize: 13, color: '#64748B', marginTop: 2 },

  modalOverlay: { flex: 1, backgroundColor: 'rgba(15, 23, 42, 0.6)', justifyContent: 'center', alignItems: 'center', padding: 20 },
  historyModalContainer: { width: '100%', maxWidth: 460, maxHeight: '80%', backgroundColor: '#FFF', borderRadius: 24, padding: 20, elevation: 12 },
  historyModalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, paddingBottom: 12, borderBottomWidth: 1, borderBottomColor: '#F1F5F9' },
  historyModalTitle: { fontSize: 18, fontWeight: 'bold', color: '#1E293B' },
  btnCloseModal: { padding: 6, borderRadius: 20, backgroundColor: '#F1F5F9' },
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

  absoluteOverlay: { position: 'absolute', top: 0, bottom: 0, left: 0, right: 0, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'center', padding: 20, zIndex: 999, elevation: 10 },
  modalContent: { backgroundColor: '#FFF', borderRadius: 24, padding: 25, elevation: 10 },
  modalHeader: { fontSize: 20, fontWeight: 'bold', color: '#134879', marginBottom: 20, textAlign: 'center' },
  inputModal: { backgroundColor: '#F8FAFC', borderWidth: 1, borderColor: '#E2E8F0', borderRadius: 12, padding: 15, marginBottom: 15, color: '#333' },
  modalButtons: { flexDirection: 'row', gap: 10 },
  btnCancelar: { flex: 1, padding: 15, alignItems: 'center', borderRadius: 12, backgroundColor: '#EDF2F7' },
  btnSalvar: { flex: 1, padding: 15, alignItems: 'center', borderRadius: 12, backgroundColor: '#0066FF' }
});