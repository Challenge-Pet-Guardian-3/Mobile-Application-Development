import React, { useState, useCallback } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  Platform, 
  TextInput, 
  KeyboardAvoidingView, 
  Alert, 
  Image, 
  ActivityIndicator 
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons'; 

import { Header } from '../../components/Header';
import { Recado } from '../../types/models';
import { AVATARES_DISPONIVEIS, getAvatarById } from '../../constants/Avatares';
import { useAuth } from '../../contexts/AuthContext';
import { usePetsFamilia } from '../../hooks/usePets';
import { useFamily } from '../../hooks/useFamily';

type Props = { navigation: NativeStackNavigationProp<any>; };

const getInitials = (name: string) => { 
  if (!name) return '??'; 
  return name.replace(' (Você)', '').substring(0, 2).toUpperCase(); 
};

const showAlert = (title: string, message: string) => {
  if (Platform.OS === 'web') {
    window.alert(`${title}\n${message}`);
  } else {
    Alert.alert(title, message);
  }
};

export default function FamilyPetScreen({ navigation }: Props) {
  const { userData } = useAuth();
  const { pets, isLoading: carregandoPets } = usePetsFamilia();
  const { 
    familia, 
    isLoading: carregandoFamilia, 
    criarFamilia, 
    entrarFamilia, 
    sairFamilia, 
    salvarRecado, 
    excluirRecado, 
    removerMembro, 
    renomearFamilia, 
    isProcessing 
  } = useFamily();

  const usuarioLogado = userData?.nome || 'Tutor';
  const { nome: nomeDaFamiliaAtual, codigoConvite, cuidadores, recados, ativa: temFamilia, souDono } = familia;

  const souUnicoMembro = cuidadores.length === 1;

  const [fluxoAberto, setFluxoAberto] = useState<'nenhum' | 'criando' | 'entrando'>('nenhum');
  const [nomeFamiliaInput, setNomeFamiliaInput] = useState('');
  const [codigoInput, setCodigoInput] = useState('');
  const [funcaoInput, setFuncaoInput] = useState('');

  const [novoRecado, setNovoRecado] = useState('');
  const [editandoId, setEditandoId] = useState<string | null>(null);
  const [caixaConviteVisivel, setCaixaConviteVisivel] = useState(false);
  const [modalNomeAberto, setModalNomeAberto] = useState(false);
  const [inputNovoNome, setInputNovoNome] = useState('');

  const handleFinalizarAcaoFamilia = useCallback(async () => {
    if (fluxoAberto === 'criando') {
      if (!nomeFamiliaInput.trim()) {
        showAlert('Atenção', 'Informe o nome da família.');
        return;
      }
      try {
        await criarFamilia(nomeFamiliaInput.trim());
        setFluxoAberto('nenhum');
        setNomeFamiliaInput('');
        showAlert('Sucesso!', 'Família criada com sucesso!');
      } catch {
        showAlert('Erro', 'Não foi possível criar a família.');
      }
    } else if (fluxoAberto === 'entrando') {
      if (!codigoInput.trim()) {
        showAlert('Atenção', 'Digite o código de convite.');
        return;
      }
      try {
        await entrarFamilia({ codigo: codigoInput.trim(), funcao: funcaoInput.trim() });
        setFluxoAberto('nenhum');
        setCodigoInput('');
        setFuncaoInput('');
        showAlert('Sucesso!', 'Você agora faz parte da família!');
      } catch (error: any) {
        showAlert('Código Inválido', error.response?.data?.message || error.message || 'Não foi possível entrar na família.');
      }
    }
  }, [fluxoAberto, nomeFamiliaInput, codigoInput, funcaoInput, criarFamilia, entrarFamilia]);

  const handleSairFamilia = useCallback(async () => {
    let confirmMessage = 'Tem certeza que deseja sair desta matilha?';
    if (souDono) {
      confirmMessage = souUnicoMembro
        ? 'Tem certeza que deseja sair? Como você é o único membro, a família será desfeita.'
        : 'Tem certeza que deseja sair? A posse da família será transferida para outro cuidador automaticamente.';
    }

    if (Platform.OS === 'web') {
      const confirmou = window.confirm(confirmMessage);
      if (confirmou) await sairFamilia();
    } else {
      Alert.alert('Sair da Matilha', confirmMessage, [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Sair', style: 'destructive', onPress: () => sairFamilia() },
      ]);
    }
  }, [souDono, souUnicoMembro, sairFamilia]);

  const handleSalvarRecado = useCallback(async () => {
    if (!novoRecado.trim()) {
      showAlert('Campo vazio', 'Escreva uma mensagem para postar no mural.');
      return;
    }
    try {
      await salvarRecado({ id: editandoId, texto: novoRecado.trim() });
      setNovoRecado('');
      setEditandoId(null);
    } catch {
      showAlert('Erro', 'Não foi possível salvar o recado.');
    }
  }, [novoRecado, editandoId, salvarRecado]);

  const handlePrepararEdicao = useCallback((recado: Recado) => {
    setNovoRecado(recado.texto);
    setEditandoId(recado.id);
  }, []);

  const handleRemoverRecado = useCallback(async (id: string) => {
    if (Platform.OS === 'web') {
      const confirmou = window.confirm('Deseja excluir este recado?');
      if (confirmou) await excluirRecado(id);
    } else {
      Alert.alert('Excluir Recado', 'Deseja excluir este recado?', [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Excluir', style: 'destructive', onPress: () => excluirRecado(id) },
      ]);
    }
  }, [excluirRecado]);

  const handleRemoverCuidador = useCallback(async (id: string, nomeMembro: string) => {
    if (Platform.OS === 'web') {
      const confirmou = window.confirm(`Remover ${nomeMembro} da família?`);
      if (confirmou) await removerMembro(id);
    } else {
      Alert.alert('Remover Cuidador', `Remover ${nomeMembro} da família?`, [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Remover', style: 'destructive', onPress: () => removerMembro(id) },
      ]);
    }
  }, [removerMembro]);

  const handleAlterarNomeFamilia = useCallback(async () => {
    if (!inputNovoNome.trim()) return;
    try {
      await renomearFamilia(inputNovoNome.trim());
      setModalNomeAberto(false);
      showAlert('Sucesso', 'Nome da família atualizado!');
    } catch {
      showAlert('Erro', 'Não foi possível renomear a família.');
    }
  }, [inputNovoNome, renomearFamilia]);

  if (carregandoPets || carregandoFamilia) {
    return (
      <View style={styles.loadingWrapper}>
        <ActivityIndicator size="large" color="#0066FF" />
        <Text style={styles.loadingText}>Carregando dados da família...</Text>
      </View>
    );
  }

  // TELA INICIAL SE NÃO TIVER FAMÍLIA
  if (!temFamilia) {
    return (
      <View style={styles.container}>
        <View style={{ paddingTop: Platform.OS === 'ios' ? 50 : 30, paddingHorizontal: 20 }}>
          <Header title="Family Pet" />
        </View>
        
        <View style={styles.emptyContainer}>
          <MaterialCommunityIcons name="account-group-outline" size={70} color="#0066FF" style={{ alignSelf: 'center' }} />
          <Text style={styles.emptyTitle}>Você ainda não faz parte de uma família!</Text>
          <Text style={styles.emptySubtitle}>
            Crie sua própria matilha para convidar parentes ou entre na família de outro tutor via código.
          </Text>

          <TouchableOpacity 
            style={styles.btnPrincipal} 
            onPress={() => setFluxoAberto('criando')}
            activeOpacity={0.8}
          >
            <Text style={styles.btnPrincipalText}>Criar Nova Família</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.btnSecundario} 
            onPress={() => setFluxoAberto('entrando')}
            activeOpacity={0.8}
          >
            <Text style={styles.btnSecundarioText}>Entrar com Código</Text>
          </TouchableOpacity>
        </View>

        {fluxoAberto !== 'nenhum' && (
          <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>
                {fluxoAberto === 'criando' ? 'Criar Família' : 'Entrar com Código'}
              </Text>
              
              {fluxoAberto === 'criando' ? (
                <TextInput 
                  style={styles.modalInput} 
                  placeholder="Ex: Família Silva" 
                  placeholderTextColor="#999" 
                  value={nomeFamiliaInput} 
                  onChangeText={setNomeFamiliaInput} 
                />
              ) : (
                <>
                  <TextInput 
                    style={styles.modalInput} 
                    placeholder="Código de Convite (Ex: PET-7890)" 
                    placeholderTextColor="#999" 
                    value={codigoInput} 
                    autoCapitalize="characters"
                    onChangeText={setCodigoInput} 
                  />
                  <TextInput 
                    style={styles.modalInput} 
                    placeholder="Sua função (Ex: Co-cuidador, Irmão, Tia)" 
                    placeholderTextColor="#999" 
                    value={funcaoInput} 
                    onChangeText={setFuncaoInput} 
                  />
                </>
              )}

              <TouchableOpacity 
                style={[styles.modalBtnSalvar, isProcessing && { opacity: 0.7 }]} 
                onPress={handleFinalizarAcaoFamilia}
                disabled={isProcessing}
              >
                {isProcessing ? (
                  <ActivityIndicator color="#FFF" />
                ) : (
                  <Text style={styles.modalBtnSalvarText}>Confirmar</Text>
                )}
              </TouchableOpacity>

              <TouchableOpacity onPress={() => setFluxoAberto('nenhum')} disabled={isProcessing}>
                <Text style={styles.modalBtnCancelar}>Voltar</Text>
              </TouchableOpacity>
            </View>
          </KeyboardAvoidingView>
        )}
      </View>
    );
  }

  // TELA PRINCIPAL DA MATILHA
  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={{ padding: 24, paddingBottom: 140 }} showsVerticalScrollIndicator={false}>
        
        <View style={{ paddingTop: Platform.OS === 'ios' ? 30 : 10, paddingBottom: 10 }}>
          <Header title={nomeDaFamiliaAtual} />
        </View>

        {/* Nossos Animais */}
        <Text style={styles.sectionTitle}>Nossos Animais</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 25 }}>
          {pets.length === 0 ? (
            <TouchableOpacity onPress={() => navigation.navigate('MeuPet')}>
              <Text style={styles.emptyPetsText}>Nenhum pet cadastrado. Toque aqui para adicionar!</Text>
            </TouchableOpacity>
          ) : (
            pets.map(pet => {
              const avatarKey = pet.avatarId ? String(pet.avatarId) : '1';
              const avatarImage = getAvatarById(avatarKey) || AVATARES_DISPONIVEIS[0].imagem;
              return (
                <View key={pet.id} style={{ alignItems: 'center', marginRight: 15 }}>
                  <View style={styles.petAvatarBorder}>
                    <Image source={avatarImage} style={{ width: '100%', height: '100%' }} resizeMode="cover" />
                  </View>
                  <Text style={styles.petAvatarName}>{(pet.nome || '').split(' ')[0]}</Text>
                </View>
              );
            })
          )}
        </ScrollView>

        {/* Cabeçalho da Lista de Cuidadores */}
        <View style={styles.cantoFamiliaHeader}>
          <Text style={styles.sectionTitle}>Canto da Família</Text>
          {souDono && (
            <TouchableOpacity 
              onPress={() => { setInputNovoNome(nomeDaFamiliaAtual); setModalNomeAberto(true); }} 
              style={{ flexDirection: 'row', alignItems: 'center' }}
            >
              <Ionicons name="pencil" size={16} color="#0066FF" />
              <Text style={styles.btnRenomearText}>Renomear</Text>
            </TouchableOpacity>
          )}
        </View>
        <Text style={styles.sectionSubtitle}>Lista de Cuidadores</Text>

        {/* Lista de Cuidadores */}
        {cuidadores.map((c, index) => {
          const nomeLimpo = c.nome.replace(' (Você)', '').trim();
          const isEuMesmo = nomeLimpo.toLowerCase() === usuarioLogado.trim().toLowerCase();

          return (
            <Animated.View 
              key={c.id || index.toString()} 
              entering={FadeInDown.delay(index * 100)} 
              style={styles.cuidadorCard}
            >
              <View style={styles.initialsCircle}>
                <Text style={styles.initialsText}>{getInitials(nomeLimpo)}</Text>
              </View>
              
              <View style={{ flex: 1 }}>
                <Text style={styles.cuidadorNome}>{isEuMesmo ? `${nomeLimpo} (Você)` : nomeLimpo}</Text>
                <Text style={styles.cuidadorFuncao}>{c.funcao}</Text>
              </View>
              
              {/* Botão de expulsar membro (apenas o dono) */}
              {souDono && !isEuMesmo && (
                <TouchableOpacity onPress={() => handleRemoverCuidador(c.id, nomeLimpo)} style={{ padding: 8 }}>
                  <Ionicons name="exit-outline" size={24} color="#FF3B30" />
                </TouchableOpacity>
              )}

              {/* Botão para o próprio membro sair da matilha */}
              {isEuMesmo && (
                <TouchableOpacity 
                  onPress={handleSairFamilia} 
                  style={styles.btnSairProprioCard}
                  activeOpacity={0.7}
                >
                  <Ionicons name="log-out-outline" size={18} color="#FF3B30" />
                  <Text style={styles.btnSairProprioText}>Sair</Text>
                </TouchableOpacity>
              )}
            </Animated.View>
          );
        })}

        {/* Botão Convidar Familiar */}
        <TouchableOpacity 
          style={styles.btnConvidar} 
          onPress={() => setCaixaConviteVisivel(true)} 
          activeOpacity={0.8}
        >
          <Text style={styles.btnConvidarText}>+ Convidar Familiar</Text>
        </TouchableOpacity>

        {/* Mural da Família */}
        <View style={styles.muralCard}>
          <Text style={styles.muralTitle}>Mural da Família:</Text>
          <TextInput 
            style={styles.muralInput} 
            placeholder="Compartilhe um aviso sobre os cuidados..." 
            placeholderTextColor="#999" 
            value={novoRecado} 
            onChangeText={setNovoRecado} 
            multiline 
          />
          
          <TouchableOpacity 
            style={[styles.btnSalvarRecado, isProcessing && { opacity: 0.7 }]} 
            onPress={handleSalvarRecado}
            disabled={isProcessing}
          >
            <Text style={styles.btnSalvarRecadoText}>{editandoId ? 'Atualizar Recado' : 'Adicionar Recado'}</Text>
          </TouchableOpacity>
          
          {editandoId && (
            <TouchableOpacity onPress={() => { setEditandoId(null); setNovoRecado(''); }}>
              <Text style={styles.btnCancelarEdicao}>Cancelar Edição</Text>
            </TouchableOpacity>
          )}

          <View style={{ marginTop: 10 }}>
            {recados.length === 0 ? (
              <Text style={styles.emptyRecados}>Nenhum recado ainda hoje.</Text>
            ) : (
              recados.map((recado) => (
                <View key={recado.id} style={styles.recadoItem}>
                  <View style={{ flex: 1, paddingRight: 10 }}>
                    <Text style={styles.recadoAutor}>{recado.autor}</Text>
                    <Text style={styles.recadoTexto}>{recado.texto}</Text>
                    <Text style={styles.recadoHora}>{recado.hora}</Text>
                  </View>
                  <View style={{ flexDirection: 'row', gap: 6, paddingTop: 4 }}>
                    {recado.autor === usuarioLogado && (
                      <TouchableOpacity onPress={() => handlePrepararEdicao(recado)} style={{ padding: 6 }}>
                        <Ionicons name="pencil" size={18} color="#64748B" />
                      </TouchableOpacity>
                    )}
                    {(recado.autor === usuarioLogado || souDono) && (
                      <TouchableOpacity onPress={() => handleRemoverRecado(recado.id)} style={{ padding: 6 }}>
                        <Ionicons name="trash-outline" size={18} color="#EF4444" />
                      </TouchableOpacity>
                    )}
                  </View>
                </View>
              ))
            )}
          </View>
        </View>

        {/* Ação de Sair da Matilha */}
        <TouchableOpacity onPress={handleSairFamilia} style={styles.btnSairContainer} activeOpacity={0.8}>
          <Ionicons name="log-out-outline" size={18} color="#FF3B30" style={{ marginRight: 6 }} />
          <Text style={styles.btnSairText}>
            {souDono && souUnicoMembro ? 'Desfazer Família' : 'Sair da Matilha'}
          </Text>
        </TouchableOpacity>

      </ScrollView>

      {/* Modal: Renomear Família */}
      {modalNomeAberto && (
        <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Renomear Família</Text>
            <TextInput 
              style={styles.modalInput} 
              placeholder="Novo nome da família..." 
              placeholderTextColor="#999" 
              value={inputNovoNome} 
              onChangeText={setInputNovoNome} 
            />
            <TouchableOpacity style={styles.modalBtnSalvar} onPress={handleAlterarNomeFamilia}>
              <Text style={styles.modalBtnSalvarText}>Salvar</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setModalNomeAberto(false)}>
              <Text style={styles.modalBtnCancelar}>Cancelar</Text>
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      )}

      {/* Modal: Código de Convite */}
      {caixaConviteVisivel && (
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Convite da Família</Text>
            <Text style={styles.conviteSubtext}>Compartilhe o código abaixo com seus familiares!</Text>
            <View style={styles.codigoBox}>
              <Text style={styles.codigoText}>{codigoConvite}</Text>
            </View>
            <TouchableOpacity style={styles.modalBtnSalvar} onPress={() => setCaixaConviteVisivel(false)}>
              <Text style={styles.modalBtnSalvarText}>Fechar</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FAFAFA' },
  loadingWrapper: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#FAFAFA' },
  loadingText: { marginTop: 12, fontSize: 15, color: '#64748B', fontWeight: '500' },
  
  emptyContainer: { flex: 1, justifyContent: 'center', padding: 30, gap: 14 },
  emptyTitle: { fontSize: 20, fontWeight: '700', color: '#1A1A1A', textAlign: 'center' },
  emptySubtitle: { fontSize: 14, color: '#666', textAlign: 'center', marginBottom: 15, lineHeight: 20 },
  btnPrincipal: { backgroundColor: '#0066FF', paddingVertical: 18, borderRadius: 16, alignItems: 'center', elevation: 4 },
  btnPrincipalText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  btnSecundario: { borderWidth: 2, borderColor: '#0066FF', paddingVertical: 18, borderRadius: 16, alignItems: 'center' },
  btnSecundarioText: { color: '#0066FF', fontWeight: 'bold', fontSize: 16 },

  sectionTitle: { fontSize: 18, fontWeight: '700', color: '#1A1A1A', marginBottom: 10 },
  sectionSubtitle: { fontSize: 14, color: '#666', marginBottom: 20 },
  emptyPetsText: { color: '#0066FF', fontStyle: 'italic', paddingVertical: 10 },
  petAvatarBorder: { width: 60, height: 60, borderRadius: 30, backgroundColor: '#E2E8F0', justifyContent: 'center', alignItems: 'center', borderWidth: 2, borderColor: '#0066FF', overflow: 'hidden' },
  petAvatarName: { marginTop: 5, fontWeight: 'bold', color: '#333' },
  cantoFamiliaHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
  btnRenomearText: { color: '#0066FF', fontWeight: 'bold', marginLeft: 4, fontSize: 14 },
  cuidadorCard: { flexDirection: 'row', alignItems: 'center', padding: 16, borderRadius: 20, marginBottom: 16, borderWidth: 1, borderColor: '#F0F0F0', backgroundColor: '#FFF', elevation: 2 },
  initialsCircle: { width: 46, height: 46, borderRadius: 23, borderWidth: 1.5, borderColor: '#333', alignItems: 'center', justifyContent: 'center', marginRight: 15 },
  initialsText: { fontWeight: 'bold', fontSize: 15, color: '#333' },
  cuidadorNome: { fontWeight: 'bold', fontSize: 16, color: '#1A1A1A' },
  cuidadorFuncao: { fontSize: 13, color: '#666', marginTop: 2 },
  btnSairProprioCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFF1F2', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 12, borderWidth: 1, borderColor: '#FFE4E6' },
  btnSairProprioText: { color: '#FF3B30', fontSize: 13, fontWeight: 'bold', marginLeft: 4 },
  btnConvidar: { backgroundColor: '#0066FF', paddingVertical: 18, borderRadius: 15, alignItems: 'center', marginTop: 10, marginBottom: 35, elevation: 4 },
  btnConvidarText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  muralCard: { padding: 20, borderRadius: 20, borderWidth: 1, borderColor: '#F0F0F0', backgroundColor: '#FFF', elevation: 2 },
  muralTitle: { fontSize: 16, fontWeight: 'bold', color: '#333', marginBottom: 15 },
  muralInput: { borderWidth: 1, borderColor: '#EAEAEA', borderRadius: 12, padding: 12, marginBottom: 12, fontSize: 14, backgroundColor: '#FAFAFA', minHeight: 60, textAlignVertical: 'top' },
  btnSalvarRecado: { backgroundColor: '#0066FF', paddingVertical: 12, borderRadius: 12, alignItems: 'center', marginBottom: 10 },
  btnSalvarRecadoText: { color: '#FFF', fontWeight: 'bold', fontSize: 14 },
  btnCancelarEdicao: { textAlign: 'center', color: '#666', marginBottom: 15, fontSize: 13, textDecorationLine: 'underline' },
  emptyRecados: { fontSize: 14, color: '#999', fontStyle: 'italic', textAlign: 'center' },
  recadoItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#F5F5F5' },
  recadoAutor: { fontSize: 12, fontWeight: '700', color: '#0066FF', marginBottom: 2 },
  recadoTexto: { fontSize: 14, color: '#333', lineHeight: 20 },
  recadoHora: { fontSize: 11, color: '#999', marginTop: 4 },
  btnSairContainer: { marginTop: 35, paddingVertical: 14, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', backgroundColor: '#FFF5F5', borderRadius: 14, borderWidth: 1, borderColor: '#FED7D7' },
  btnSairText: { textAlign: 'center', color: '#FF3B30', fontWeight: 'bold', fontSize: 15 },

  modalOverlay: { position: 'absolute', top: 0, bottom: 0, left: 0, right: 0, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center', padding: 20, zIndex: 1000 },
  modalContent: { width: '100%', maxWidth: 420, backgroundColor: '#FFF', borderRadius: 20, padding: 24, elevation: 10 },
  modalTitle: { fontSize: 22, fontWeight: 'bold', color: '#1A1A1A', textAlign: 'center', marginBottom: 20 },
  modalInput: { borderWidth: 1, borderColor: '#EAEAEA', borderRadius: 12, padding: 16, marginBottom: 16, fontSize: 16, backgroundColor: '#FAFAFA' },
  modalBtnSalvar: { backgroundColor: '#0066FF', paddingVertical: 16, borderRadius: 12, alignItems: 'center', marginBottom: 15 },
  modalBtnSalvarText: { color: '#FFF', fontWeight: 'bold', fontSize: 16 },
  modalBtnCancelar: { color: '#666', fontSize: 14, textAlign: 'center', textDecorationLine: 'underline' },
  conviteSubtext: { textAlign: 'center', marginBottom: 20, color: '#666' },
  codigoBox: { backgroundColor: '#F0F8FF', padding: 20, borderRadius: 12, alignItems: 'center', marginBottom: 25, borderWidth: 1, borderColor: '#0066FF', borderStyle: 'dashed' },
  codigoText: { fontSize: 24, fontWeight: 'bold', color: '#0066FF', letterSpacing: 2 }
});