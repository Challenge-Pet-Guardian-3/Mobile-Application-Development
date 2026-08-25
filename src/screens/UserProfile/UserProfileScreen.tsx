import React, { useState, useEffect, useCallback, useMemo } from 'react';
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
  ActivityIndicator 
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
import { StatCard } from '../../components/StatCard';
import { useAuth } from '../../contexts/AuthContext';
import { useUsuario } from '../../hooks/useUsuario';
import { useHome } from '../../hooks/useHome';
import { useFamily } from '../../hooks/useFamily';
import { api } from '../../services/api';

const showAlert = (title: string, message: string) => {
  if (Platform.OS === 'web') {
    window.alert(`${title}\n${message}`);
  } else {
    Alert.alert(title, message);
  }
};

// Funções de Máscara
const maskPhone = (value: string) => {
  const digits = value.replace(/\D/g, '').slice(0, 11);
  if (digits.length <= 2) return digits.length ? `(${digits}` : '';
  if (digits.length <= 6) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
  if (digits.length <= 10) return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`;
  return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7, 11)}`;
};

const maskCEP = (value: string) => {
  const digits = value.replace(/\D/g, '').slice(0, 8);
  if (digits.length <= 5) return digits;
  return `${digits.slice(0, 5)}-${digits.slice(5)}`;
};

const maskUF = (value: string) => {
  return value.replace(/[^a-zA-Z]/g, '').slice(0, 2).toUpperCase();
};

export default function UserProfileScreen({ navigation }: any) {
  const { signOut, userData, updateUserData } = useAuth();
  const { usuario, isLoading: carregandoUsuario, updateUsuario, isUpdating } = useUsuario();
  const { xpTotal, ofensivaTotal, temFamilia } = useHome();
  const { familia } = useFamily();

  const [nome, setNome] = useState(userData?.nome || 'Tutor PetGuardian');
  const [email, setEmail] = useState(userData?.email || '');

  const [janelaAberta, setJanelaAberta] = useState<'nenhum' | 'editar' | 'faq' | 'contato'>('nenhum');

  const [editForm, setEditForm] = useState({
    nome: '',
    email: '',
    telefone: '',
    senha: '',
    confirmarSenha: '',
    cep: '',
    logradouro: '',
    numero: '',
    complemento: '',
    bairro: '',
    cidade: '',
    estado: ''
  });

  const [editErros, setEditErros] = useState<Record<string, string>>({});
  const [salvandoTudo, setSalvandoTudo] = useState(false);
  const [msgContato, setMsgContato] = useState('');

  const rankingPosicao = useMemo(() => {
    if (!temFamilia) return '---';
    const listaCuidadores = familia?.cuidadores || [];
    if (listaCuidadores.length === 0) return xpTotal > 0 ? '1º' : '---';

    const cuidadoresComPontos = listaCuidadores.map((c: any) => {
      const nomeLimpo = (c.nome || '').replace(' (Você)', '').trim().toLowerCase();
      const isEu = 
        (userData?.id && (c.usuarioId === userData.id || c.id === userData.id)) ||
        (userData?.nome && nomeLimpo === userData.nome.trim().toLowerCase());

      const pontosMembro = isEu ? Number(xpTotal || c.xp || c.pontos || 0) : Number(c.xp || c.pontos || 0);

      return {
        ...c,
        isEu,
        pontosCalculados: pontosMembro
      };
    });

    cuidadoresComPontos.sort((a: any, b: any) => b.pontosCalculados - a.pontosCalculados);
    const index = cuidadoresComPontos.findIndex((c: any) => c.isEu);
    return index >= 0 ? `${index + 1}º` : (xpTotal > 0 ? '1º' : '---');
  }, [temFamilia, xpTotal, familia, userData]);

  const handleEditChange = useCallback((campo: keyof typeof editForm, valor: string) => {
    let valorFormatado = valor;

    if (campo === 'telefone') valorFormatado = maskPhone(valor);
    if (campo === 'cep') valorFormatado = maskCEP(valor);
    if (campo === 'estado') valorFormatado = maskUF(valor);

    setEditForm(prev => ({ ...prev, [campo]: valorFormatado }));
    setEditErros(prev => ({ ...prev, [campo]: '' }));
  }, []);

  useEffect(() => {
    if (userData) {
      setNome(userData.nome || 'Tutor PetGuardian');
      setEmail(userData.email || '');
    }
  }, [userData]);

  const handleLogout = useCallback(async () => {
    try {
      await signOut();
    } catch (error) {
      console.error(error);
    }
  }, [signOut]);

  const handleAbrirEdicao = useCallback(async () => {
    const formBase = {
      nome: userData?.nome || usuario?.nome || '',
      email: userData?.email || usuario?.email || '',
      telefone: maskPhone(usuario?.telefone || ''),
      senha: '',
      confirmarSenha: '',
      cep: '',
      logradouro: '',
      numero: '',
      complemento: '',
      bairro: '',
      cidade: '',
      estado: ''
    };

    try {
      const { data: end } = await api.get('/enderecos/me');
      if (end) {
        formBase.cep = maskCEP(end.cep || '');
        formBase.logradouro = end.logradouro || '';
        formBase.numero = end.numero || '';
        formBase.complemento = end.complemento || '';
        formBase.bairro = end.bairro || '';
        formBase.cidade = end.cidade || '';
        formBase.estado = maskUF(end.estado || '');
      }
    } catch {
      // 404 inicial é normal caso o usuário não tenha endereço cadastrado ainda
    }

    setEditForm(formBase);
    setJanelaAberta('editar');
  }, [userData, usuario]);

  const handleFecharModal = useCallback(() => {
    setJanelaAberta('nenhum');
    setEditErros({});
    setMsgContato('');
  }, []);

  const salvarEdicao = useCallback(async () => {
    const novosErros: Record<string, string> = {};

    if (!editForm.nome.trim()) novosErros.nome = 'O nome é obrigatório.';
    if (!editForm.email.trim()) novosErros.email = 'O e-mail é obrigatório.';
    if (editForm.senha && editForm.senha.length < 6) {
      novosErros.senha = 'A nova senha deve ter no mínimo 6 dígitos.';
    }
    if (editForm.senha && editForm.senha !== editForm.confirmarSenha) {
      novosErros.confirmarSenha = 'As senhas não coincidem.';
    }

    const preencheuEndereco = editForm.logradouro.trim() || editForm.cidade.trim() || editForm.cep.trim() || editForm.estado.trim();

    if (preencheuEndereco) {
      if (!editForm.cep.trim() || editForm.cep.replace(/\D/g, '').length < 8) {
        novosErros.cep = 'Informe um CEP válido com 8 dígitos.';
      }
      if (!editForm.logradouro.trim()) {
        novosErros.logradouro = 'O logradouro é obrigatório.';
      }
      if (!editForm.cidade.trim()) {
        novosErros.cidade = 'A cidade é obrigatória.';
      }
      if (!editForm.estado.trim() || editForm.estado.length < 2) {
        novosErros.estado = 'Informe a UF (2 letras).';
      }
    }

    if (Object.keys(novosErros).length > 0) {
      setEditErros(novosErros);
      return;
    }

    try {
      setSalvandoTudo(true);

      // 1. Atualizar dados do Usuário
      const payloadUsuario = {
        nome: editForm.nome.trim(),
        email: editForm.email.trim().toLowerCase(),
        senha: editForm.senha.trim() ? editForm.senha : null,
        telefone: editForm.telefone.trim() ? editForm.telefone.trim() : null
      };

      const resposta = await updateUsuario(payloadUsuario);

      if (resposta?.token) {
        api.defaults.headers.common['Authorization'] = `Bearer ${resposta.token}`;
        if (Platform.OS === 'web') {
          localStorage.setItem('@PetGuardian:token', resposta.token);
        } else {
          await AsyncStorage.setItem('@PetGuardian:token', resposta.token);
        }
      }

      // 2. Atualizar Endereço
      if (preencheuEndereco) {
        await api.put('/enderecos/me', {
          logradouro: editForm.logradouro.trim(),
          numero: editForm.numero.trim() || null,
          complemento: editForm.complemento.trim() || null,
          bairro: editForm.bairro.trim() || null,
          cidade: editForm.cidade.trim(),
          estado: editForm.estado.trim().toUpperCase(),
          cep: editForm.cep.trim()
        });
      }

      const novoUserData = { 
        ...userData, 
        nome: editForm.nome.trim(), 
        email: editForm.email.trim().toLowerCase()
      };
      await updateUserData(novoUserData as any);

      showAlert('Sucesso', 'Perfil e endereço atualizados com sucesso!');
      setJanelaAberta('nenhum');
    } catch (error: any) {
      const msg = error.response?.data?.message || 'Não foi possível salvar os dados no servidor. Verifique os campos preenchidos.';
      showAlert('Erro na API', msg);
    } finally {
      setSalvandoTudo(false);
    }
  }, [editForm, userData, updateUsuario, updateUserData]);

  const enviarContato = useCallback(() => {
    if (!msgContato.trim()) {
      showAlert('Aviso', 'Escreva uma mensagem antes de enviar.');
      return;
    }
    showAlert('Mensagem Enviada!', 'A equipe PetGuardian entrará em contato em breve.');
    setMsgContato('');
    setJanelaAberta('nenhum');
  }, [msgContato]);

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={{ paddingBottom: 130 }} showsVerticalScrollIndicator={false}>
        <View style={styles.headerBg} />
        
        {/* Avatar e Identificação */}
        <View style={styles.profileInfo}>
          <View style={styles.avatarContainer}>
            <View style={styles.avatarIconWrapper}>
              <Ionicons name="person" size={50} color="#FFF" />
            </View>
            <TouchableOpacity style={styles.editBadge} onPress={handleAbrirEdicao}>
              <MaterialCommunityIcons name="pencil" size={16} color="#FFF" />
            </TouchableOpacity>
          </View>
          <Text style={styles.userName}>{nome}</Text>
          <Text style={styles.userEmail}>{email}</Text>
        </View>

        {/* Estatísticas */}
        <View style={styles.statsRow}>
          <StatCard icon="fire" label="Ofensiva" value={`${ofensivaTotal} dias`} color="#FF9600" />
          <StatCard icon="star" label="Meu XP" value={xpTotal} color="#1CB0F6" />
          <StatCard icon="medal" label="Ranking" value={rankingPosicao} color="#58CC02" />
        </View>

        {!temFamilia && (
          <Text style={styles.avisoSemFamilia}>Entre ou crie uma família para começar a pontuar no ranking!</Text>
        )}

        {/* Menu de Configurações */}
        <View style={styles.menuContainer}>
          <Text style={styles.menuTitle}>Conta</Text>
          
          <TouchableOpacity style={styles.menuItem} onPress={handleAbrirEdicao}>
            <View style={styles.menuIconWrapper}>
              <Ionicons name="person-outline" size={22} color="#0066FF" />
            </View>
            <Text style={styles.menuText}>Gerenciar Perfil & Endereço</Text>
            <Ionicons name="chevron-forward" size={20} color="#CBD5E0" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuItem} onPress={() => setJanelaAberta('faq')}>
            <View style={styles.menuIconWrapper}>
              <Ionicons name="help-buoy-outline" size={22} color="#0066FF" />
            </View>
            <Text style={styles.menuText}>Perguntas Frequentes</Text>
            <Ionicons name="chevron-forward" size={20} color="#CBD5E0" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuItem} onPress={() => setJanelaAberta('contato')}>
            <View style={styles.menuIconWrapper}>
              <Ionicons name="chatbubbles-outline" size={22} color="#0066FF" />
            </View>
            <Text style={styles.menuText}>Contato / Suporte</Text>
            <Ionicons name="chevron-forward" size={20} color="#CBD5E0" />
          </TouchableOpacity>

          <TouchableOpacity style={[styles.menuItem, { marginTop: 20 }]} onPress={handleLogout}>
            <View style={[styles.menuIconWrapper, { backgroundColor: '#FFF5F5' }]}>
              <Ionicons name="log-out-outline" size={22} color="#E53E3E" />
            </View>
            <Text style={[styles.menuText, { color: '#E53E3E' }]}>Sair da Conta</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Modal: Editar Perfil e Endereço */}
      {janelaAberta === 'editar' && (
        <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Gerenciar Perfil</Text>
              <TouchableOpacity onPress={handleFecharModal} style={styles.closeBtn}>
                <Ionicons name="close" size={24} color="#718096" />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 20 }}>
              
              {/* DADOS PESSOAIS */}
              <Text style={styles.secaoTitulo}>Dados Pessoais</Text>

              <Text style={styles.inputLabel}>Nome Completo</Text>
              <TextInput 
                style={[styles.modalInput, editErros.nome ? styles.inputErro : null]} 
                value={editForm.nome} 
                onChangeText={(t) => handleEditChange('nome', t)} 
              />
              {editErros.nome && <Text style={styles.erroTexto}>{editErros.nome}</Text>}

              <Text style={styles.inputLabel}>E-mail</Text>
              <TextInput 
                style={[styles.modalInput, editErros.email ? styles.inputErro : null]} 
                value={editForm.email} 
                onChangeText={(t) => handleEditChange('email', t)} 
                keyboardType="email-address" 
                autoCapitalize="none" 
              />
              {editErros.email && <Text style={styles.erroTexto}>{editErros.email}</Text>}

              <Text style={styles.inputLabel}>Telefone / Celular</Text>
              <TextInput 
                style={styles.modalInput} 
                placeholder="(11) 98765-4321"
                placeholderTextColor="#A0AEC0"
                value={editForm.telefone} 
                onChangeText={(t) => handleEditChange('telefone', t)} 
                keyboardType="phone-pad"
                maxLength={15}
              />

              <Text style={styles.inputLabel}>Nova Senha (opcional)</Text>
              <TextInput 
                style={[styles.modalInput, editErros.senha ? styles.inputErro : null]} 
                value={editForm.senha} 
                placeholder="Deixe em branco para manter a atual" 
                placeholderTextColor="#A0AEC0" 
                onChangeText={(t) => handleEditChange('senha', t)} 
                secureTextEntry 
              />
              {editErros.senha && <Text style={styles.erroTexto}>{editErros.senha}</Text>}

              <Text style={styles.inputLabel}>Confirmar Nova Senha</Text>
              <TextInput 
                style={[styles.modalInput, editErros.confirmarSenha ? styles.inputErro : null]} 
                value={editForm.confirmarSenha} 
                onChangeText={(t) => handleEditChange('confirmarSenha', t)} 
                secureTextEntry 
              />
              {editErros.confirmarSenha && <Text style={styles.erroTexto}>{editErros.confirmarSenha}</Text>}

              {/* ENDEREÇO RESIDENCIAL */}
              <Text style={[styles.secaoTitulo, { marginTop: 15 }]}>Endereço Residencial</Text>

              <Text style={styles.inputLabel}>CEP</Text>
              <TextInput 
                style={[styles.modalInput, editErros.cep ? styles.inputErro : null]} 
                placeholder="00000-000"
                placeholderTextColor="#A0AEC0"
                value={editForm.cep} 
                onChangeText={(t) => handleEditChange('cep', t)} 
                keyboardType="numeric"
                maxLength={9}
              />
              {editErros.cep && <Text style={styles.erroTexto}>{editErros.cep}</Text>}

              <Text style={styles.inputLabel}>Logradouro (Rua / Avenida)</Text>
              <TextInput 
                style={[styles.modalInput, editErros.logradouro ? styles.inputErro : null]} 
                placeholder="Ex: Av. Paulista"
                placeholderTextColor="#A0AEC0"
                value={editForm.logradouro} 
                onChangeText={(t) => handleEditChange('logradouro', t)} 
              />
              {editErros.logradouro && <Text style={styles.erroTexto}>{editErros.logradouro}</Text>}

              <View style={styles.rowInputs}>
                <View style={{ flex: 1, marginRight: 8 }}>
                  <Text style={styles.inputLabel}>Número</Text>
                  <TextInput 
                    style={styles.modalInput} 
                    placeholder="100"
                    placeholderTextColor="#A0AEC0"
                    value={editForm.numero} 
                    onChangeText={(t) => handleEditChange('numero', t)} 
                    maxLength={10}
                  />
                </View>
                <View style={{ flex: 1.5 }}>
                  <Text style={styles.inputLabel}>Complemento</Text>
                  <TextInput 
                    style={styles.modalInput} 
                    placeholder="Apto 42"
                    placeholderTextColor="#A0AEC0"
                    value={editForm.complemento} 
                    onChangeText={(t) => handleEditChange('complemento', t)} 
                    maxLength={60}
                  />
                </View>
              </View>

              <Text style={styles.inputLabel}>Bairro</Text>
              <TextInput 
                style={styles.modalInput} 
                placeholder="Bela Vista"
                placeholderTextColor="#A0AEC0"
                value={editForm.bairro} 
                onChangeText={(t) => handleEditChange('bairro', t)} 
                maxLength={80}
              />

              <View style={styles.rowInputs}>
                <View style={{ flex: 2, marginRight: 8 }}>
                  <Text style={styles.inputLabel}>Cidade</Text>
                  <TextInput 
                    style={[styles.modalInput, editErros.cidade ? styles.inputErro : null]} 
                    placeholder="São Paulo"
                    placeholderTextColor="#A0AEC0"
                    value={editForm.cidade} 
                    onChangeText={(t) => handleEditChange('cidade', t)} 
                  />
                  {editErros.cidade && <Text style={styles.erroTexto}>{editErros.cidade}</Text>}
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.inputLabel}>UF</Text>
                  <TextInput 
                    style={[styles.modalInput, editErros.estado ? styles.inputErro : null]} 
                    placeholder="SP"
                    maxLength={2}
                    autoCapitalize="characters"
                    placeholderTextColor="#A0AEC0"
                    value={editForm.estado} 
                    onChangeText={(t) => handleEditChange('estado', t)} 
                  />
                  {editErros.estado && <Text style={styles.erroTexto}>{editErros.estado}</Text>}
                </View>
              </View>

              <TouchableOpacity 
                style={[styles.modalBtnSalvar, (salvandoTudo || isUpdating || carregandoUsuario) && { opacity: 0.7 }]} 
                onPress={salvarEdicao} 
                disabled={salvandoTudo || isUpdating || carregandoUsuario}
              >
                {salvandoTudo || isUpdating ? (
                  <ActivityIndicator color="#FFF" />
                ) : (
                  <Text style={styles.modalBtnSalvarText}>Salvar Alterações</Text>
                )}
              </TouchableOpacity>
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      )}

      {/* Modal: FAQ */}
      {janelaAberta === 'faq' && (
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { maxHeight: '85%' }]}>
            <View style={styles.modalHeader}>
              <View style={{flexDirection: 'row', alignItems: 'center'}}>
                <Ionicons name="help-buoy" size={24} color="#0066FF" style={{marginRight: 8}} />
                <Text style={styles.modalTitle}>Dúvidas Frequentes</Text>
              </View>
              <TouchableOpacity onPress={handleFecharModal} style={styles.closeBtn}>
                <Ionicons name="close" size={24} color="#718096" />
              </TouchableOpacity>
            </View>
            <ScrollView showsVerticalScrollIndicator={false}>
              <View style={styles.faqCard}>
                <View style={styles.faqQuestionRow}>
                  <Ionicons name="people-outline" size={20} color="#0066FF" />
                  <Text style={styles.faqQuestion}>Como convidar familiares?</Text>
                </View>
                <Text style={styles.faqAnswer}>Na aba "Family Pet", compartilhe o código da família para incluir novos tutores.</Text>
              </View>
            </ScrollView>
          </View>
        </View>
      )}

      {/* Modal: Contato */}
      {janelaAberta === 'contato' && (
        <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Suporte Técnico</Text>
              <TouchableOpacity onPress={handleFecharModal} style={styles.closeBtn}>
                <Ionicons name="close" size={24} color="#718096" />
              </TouchableOpacity>
            </View>
            <ScrollView showsVerticalScrollIndicator={false}>
              <Text style={styles.contatoDesc}>Envie sua mensagem para a equipe de suporte do PetGuardian.</Text>
              <TextInput 
                style={[styles.modalInput, { height: 120, textAlignVertical: 'top', paddingTop: 16 }]} 
                placeholder="Descreva sua dúvida ou problema..." 
                placeholderTextColor="#A0AEC0" 
                value={msgContato} 
                onChangeText={setMsgContato} 
                multiline 
              />
              <TouchableOpacity style={styles.modalBtnSalvar} onPress={enviarContato}>
                <Ionicons name="paper-plane-outline" size={20} color="#FFF" style={{marginRight: 8}} />
                <Text style={styles.modalBtnSalvarText}>Enviar Mensagem</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  headerBg: { height: 120, backgroundColor: '#0A1628', width: '100%' },
  profileInfo: { alignItems: 'center', marginTop: -50 },
  avatarContainer: { width: 100, height: 100, borderRadius: 50, borderWidth: 4, borderColor: '#F8FAFC', backgroundColor: '#E2E8F0', elevation: 4 },
  avatarIconWrapper: { width: '100%', height: '100%', borderRadius: 50, backgroundColor: '#A0AEC0', justifyContent: 'center', alignItems: 'center' },
  editBadge: { position: 'absolute', bottom: 0, right: 0, backgroundColor: '#0066FF', width: 34, height: 34, borderRadius: 17, justifyContent: 'center', alignItems: 'center', borderWidth: 3, borderColor: '#F8FAFC' },
  userName: { fontSize: 24, fontWeight: 'bold', color: '#1A202C', marginTop: 15 },
  userEmail: { fontSize: 15, color: '#718096', marginTop: 4 },
  statsRow: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 20, marginTop: 25 },
  avisoSemFamilia: { textAlign: 'center', color: '#718096', fontSize: 13, marginTop: 15, paddingHorizontal: 40 },
  menuContainer: { marginTop: 35, paddingHorizontal: 20 },
  menuTitle: { fontSize: 16, fontWeight: 'bold', color: '#4A5568', marginBottom: 15, marginLeft: 5 },
  menuItem: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFF', padding: 12, borderRadius: 16, marginBottom: 12, elevation: 1 },
  menuIconWrapper: { width: 40, height: 40, borderRadius: 12, backgroundColor: '#EBF4FF', justifyContent: 'center', alignItems: 'center' },
  menuText: { flex: 1, marginLeft: 15, fontSize: 16, color: '#2D3748', fontWeight: '600' },
  modalOverlay: { position: 'absolute', top: 0, bottom: 0, left: 0, right: 0, backgroundColor: 'rgba(10, 22, 40, 0.6)', justifyContent: 'center', alignItems: 'center', padding: 20, zIndex: 1000 },
  modalContent: { width: '100%', backgroundColor: '#FFF', borderRadius: 24, padding: 24, elevation: 10, maxHeight: '85%' },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 },
  modalTitle: { fontSize: 22, fontWeight: 'bold', color: '#1A202C' },
  closeBtn: { padding: 4, backgroundColor: '#F7FAFC', borderRadius: 20 },
  secaoTitulo: { fontSize: 16, fontWeight: '800', color: '#0066FF', marginBottom: 12, marginTop: 5 },
  inputLabel: { fontSize: 13, fontWeight: '700', color: '#4A5568', marginBottom: 6, marginLeft: 2 },
  modalInput: { backgroundColor: '#F7FAFC', borderWidth: 1, borderColor: '#E2E8F0', borderRadius: 14, padding: 14, marginBottom: 14, fontSize: 15, color: '#2D3748' },
  rowInputs: { flexDirection: 'row', justifyContent: 'space-between' },
  inputErro: { borderColor: '#E53E3E', borderWidth: 1.5, backgroundColor: '#FFF5F5' },
  erroTexto: { color: '#E53E3E', fontSize: 12, marginTop: -10, marginBottom: 12, marginLeft: 4, fontWeight: '500' },
  modalBtnSalvar: { backgroundColor: '#0066FF', paddingVertical: 16, borderRadius: 16, alignItems: 'center', marginTop: 10, flexDirection: 'row', justifyContent: 'center' },
  modalBtnSalvarText: { color: '#FFF', fontWeight: 'bold', fontSize: 16 },
  faqCard: { backgroundColor: '#F8FAFC', padding: 16, borderRadius: 16, marginBottom: 14, borderWidth: 1, borderColor: '#EDF2F7' },
  faqQuestionRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  faqQuestion: { fontWeight: 'bold', color: '#1A202C', fontSize: 15, marginLeft: 8, flex: 1 },
  faqAnswer: { color: '#4A5568', fontSize: 13, lineHeight: 20 },
  contatoDesc: { color: '#718096', marginBottom: 16, fontSize: 14, lineHeight: 20 },
});