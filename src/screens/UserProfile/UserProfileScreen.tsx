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
import { ProfileEditSchema } from '../../utils/schemas';
import { useAuth } from '../../contexts/AuthContext';
import { useUsuario } from '../../hooks/useUsuario';
import { useHome } from '../../hooks/useHome';
import { useFamily } from '../../hooks/useFamily';
import { api } from '../../services/api';
import { z } from 'zod';

const showAlert = (title: string, message: string) => {
  if (Platform.OS === 'web') {
    window.alert(`${title}\n${message}`);
  } else {
    Alert.alert(title, message);
  }
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
    senha: '',
    confirmarSenha: ''
  });

  const [editErros, setEditErros] = useState({
    nome: '',
    email: '',
    senha: '',
    confirmarSenha: ''
  });

  const [msgContato, setMsgContato] = useState('');

  // Cálculo de Ranking dinâmico baseado no XP dos cuidadores da família
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
    if (index >= 0) {
      return `${index + 1}º`;
    }

    return xpTotal > 0 ? '1º' : '---';
  }, [temFamilia, xpTotal, familia, userData]);

  const handleEditChange = useCallback((campo: keyof typeof editForm, valor: string) => {
    setEditForm(prev => ({ ...prev, [campo]: valor }));
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

  const handleAbrirEdicao = useCallback(() => {
    setEditForm({
      nome: userData?.nome || '',
      email: userData?.email || '',
      senha: '',
      confirmarSenha: ''
    });
    setJanelaAberta('editar');
  }, [userData]);

  const handleFecharModal = useCallback(() => {
    setJanelaAberta('nenhum');
    setEditErros({ nome: '', email: '', senha: '', confirmarSenha: '' });
    setMsgContato('');
  }, []);

  const salvarEdicao = useCallback(async () => {
    setEditErros({ nome: '', email: '', senha: '', confirmarSenha: '' });

    try {
      ProfileEditSchema.parse({
        nome: editForm.nome.trim(),
        email: editForm.email.trim(),
        senha: editForm.senha,
        confirmarSenha: editForm.confirmarSenha
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        const novosErros = { nome: '', email: '', senha: '', confirmarSenha: '' };
        error.issues.forEach((err) => {
          const field = err.path[0] as keyof typeof novosErros;
          if (field) novosErros[field] = err.message;
        });
        setEditErros(novosErros);
      }
      return;
    }

    try {
      const primeiroEndereco = usuario?.enderecos?.[0];

      const resposta = await updateUsuario({
        nome: editForm.nome.trim(),
        email: editForm.email.trim(),
        senha: editForm.senha ? editForm.senha : undefined,
        ddd: usuario?.ddd || '11',
        numeroTelefone: usuario?.numeroTelefone || '999999999',
        endereco: {
          cep: primeiroEndereco?.cep || '01001-000',
          numero: primeiroEndereco?.numero || '100',
        },
      });

      // Sincroniza o novo Token JWT no Axios e no Storage
      if (resposta?.token) {
        api.defaults.headers.common['Authorization'] = `Bearer ${resposta.token}`;
        if (Platform.OS === 'web') {
          localStorage.setItem('@PetGuardian:token', resposta.token);
        } else {
          await AsyncStorage.setItem('@PetGuardian:token', resposta.token);
        }
      }

      const novoUserData = { 
        ...userData, 
        nome: editForm.nome.trim(), 
        email: editForm.email.trim()
      };
      await updateUserData(novoUserData as any);

      showAlert('Sucesso', 'Perfil atualizado com sucesso!');
      setJanelaAberta('nenhum');
    } catch (error: any) {
      const msg = error.response?.data?.message || 'Não foi possível salvar os dados no servidor.';
      showAlert('Erro na API', msg);
    }
  }, [editForm, usuario, userData, updateUsuario, updateUserData]);

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
        
        {/* Foto de Perfil e Identificação */}
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

        {/* Estatísticas com Ranking Dinâmico */}
        <View style={styles.statsRow}>
          <StatCard 
            icon="fire" 
            label="Ofensiva" 
            value={`${ofensivaTotal} dias`} 
            color="#FF9600" 
          />
          <StatCard 
            icon="star" 
            label="Meu XP" 
            value={xpTotal} 
            color="#1CB0F6" 
          />
          <StatCard 
            icon="medal" 
            label="Ranking" 
            value={rankingPosicao} 
            color="#58CC02" 
          />
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
            <Text style={styles.menuText}>Gerenciar Perfil & Segurança</Text>
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

      {/* Modal: Editar Perfil */}
      {janelaAberta === 'editar' && (
        <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Gerenciar Perfil</Text>
              <TouchableOpacity onPress={handleFecharModal} style={styles.closeBtn}>
                <Ionicons name="close" size={24} color="#718096" />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              <Text style={styles.inputLabel}>Nome Completo</Text>
              <TextInput 
                style={[styles.modalInput, editErros.nome !== '' ? styles.inputErro : null]} 
                value={editForm.nome} 
                onChangeText={(t) => handleEditChange('nome', t)} 
              />
              {editErros.nome !== '' && <Text style={styles.erroTexto}>{editErros.nome}</Text>}

              <Text style={styles.inputLabel}>E-mail</Text>
              <TextInput 
                style={[styles.modalInput, editErros.email !== '' ? styles.inputErro : null]} 
                value={editForm.email} 
                onChangeText={(t) => handleEditChange('email', t)} 
                keyboardType="email-address" 
                autoCapitalize="none" 
              />
              {editErros.email !== '' && <Text style={styles.erroTexto}>{editErros.email}</Text>}

              <Text style={styles.inputLabel}>Nova Senha (opcional)</Text>
              <TextInput 
                style={[styles.modalInput, editErros.senha !== '' ? styles.inputErro : null]} 
                value={editForm.senha} 
                placeholder="Deixe em branco para manter a atual"
                placeholderTextColor="#A0AEC0"
                onChangeText={(t) => handleEditChange('senha', t)} 
                secureTextEntry 
              />
              {editErros.senha !== '' && <Text style={styles.erroTexto}>{editErros.senha}</Text>}

              <Text style={styles.inputLabel}>Confirmar Nova Senha</Text>
              <TextInput 
                style={[styles.modalInput, editErros.confirmarSenha !== '' ? styles.inputErro : null]} 
                value={editForm.confirmarSenha} 
                onChangeText={(t) => handleEditChange('confirmarSenha', t)} 
                secureTextEntry 
              />
              {editErros.confirmarSenha !== '' && <Text style={styles.erroTexto}>{editErros.confirmarSenha}</Text>}

              <TouchableOpacity
                style={[styles.modalBtnSalvar, (isUpdating || carregandoUsuario) && { opacity: 0.7 }]}
                onPress={salvarEdicao}
                disabled={isUpdating || carregandoUsuario}
              >
                {isUpdating ? (
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
            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 30 }}>
              <View style={styles.faqCard}>
                <View style={styles.faqQuestionRow}>
                  <Ionicons name="people-outline" size={20} color="#0066FF" />
                  <Text style={styles.faqQuestion}>Como convidar familiares?</Text>
                </View>
                <Text style={styles.faqAnswer}>Na aba "Family Pet", você pode compartilhar o código de convite da sua família para que outros cuidadores entrem no grupo.</Text>
              </View>

              <View style={styles.faqCard}>
                <View style={styles.faqQuestionRow}>
                  <Ionicons name="checkmark-done-circle-outline" size={22} color="#0066FF" />
                  <Text style={styles.faqQuestion}>Se eu fizer uma tarefa, os outros veem?</Text>
                </View>
                <Text style={styles.faqAnswer}>Sim! A rotina é centralizada. Quando você conclui uma tarefa, a pontuação é atualizada para todos os membros da família.</Text>
              </View>

              <View style={styles.faqCard}>
                <View style={styles.faqQuestionRow}>
                  <Ionicons name="trophy-outline" size={20} color="#0066FF" />
                  <Text style={styles.faqQuestion}>Como funciona o Ranking e o XP?</Text>
                </View>
                <Text style={styles.faqAnswer}>Cada tarefa diária concluída soma XP ao seu perfil e atualiza a sua classificação em tempo real na família.</Text>
              </View>

              <View style={styles.faqCard}>
                <View style={styles.faqQuestionRow}>
                  <Ionicons name="flame-outline" size={20} color="#0066FF" />
                  <Text style={styles.faqQuestion}>O que é a Ofensiva da Semana?</Text>
                </View>
                <Text style={styles.faqAnswer}>É a sequência contínua de dias em que as tarefas dos pets foram cumpridas.</Text>
              </View>
            </ScrollView>
          </View>
        </View>
      )}

      {/* Modal: Suporte */}
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
              <Text style={styles.contatoDesc}>Encontrou algum problema ou tem sugestões? Envie uma mensagem para a equipe PetGuardian.</Text>
              <TextInput 
                style={[styles.modalInput, { height: 140, textAlignVertical: 'top', paddingTop: 16 }]} 
                placeholder="Descreva sua mensagem aqui..." 
                placeholderTextColor="#A0AEC0" 
                value={msgContato} 
                onChangeText={setMsgContato} 
                multiline 
              />
              <TouchableOpacity style={styles.modalBtnSalvar} onPress={enviarContato}>
                <Ionicons name="paper-plane-outline" size={20} color="#FFF" style={{marginRight: 8}} />
                <Text style={styles.modalBtnSalvarText}>Enviar Feedback</Text>
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
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 25 },
  modalTitle: { fontSize: 22, fontWeight: 'bold', color: '#1A202C' },
  closeBtn: { padding: 4, backgroundColor: '#F7FAFC', borderRadius: 20 },
  inputLabel: { fontSize: 14, fontWeight: '700', color: '#4A5568', marginBottom: 8, marginLeft: 4 },
  modalInput: { backgroundColor: '#F7FAFC', borderWidth: 1, borderColor: '#E2E8F0', borderRadius: 14, padding: 16, marginBottom: 18, fontSize: 16, color: '#2D3748' },
  inputErro: { borderColor: '#E53E3E', borderWidth: 1.5, backgroundColor: '#FFF5F5' },
  erroTexto: { color: '#E53E3E', fontSize: 12, marginTop: -15, marginBottom: 15, marginLeft: 8, fontWeight: '500' },
  modalBtnSalvar: { backgroundColor: '#0066FF', paddingVertical: 18, borderRadius: 16, alignItems: 'center', marginTop: 5, flexDirection: 'row', justifyContent: 'center' },
  modalBtnSalvarText: { color: '#FFF', fontWeight: 'bold', fontSize: 16 },
  faqCard: { backgroundColor: '#F8FAFC', padding: 20, borderRadius: 16, marginBottom: 16, borderWidth: 1, borderColor: '#EDF2F7' },
  faqQuestionRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  faqQuestion: { fontWeight: 'bold', color: '#1A202C', fontSize: 16, marginLeft: 8, flex: 1 },
  faqAnswer: { color: '#4A5568', fontSize: 14, lineHeight: 22 },
  contatoDesc: { color: '#718096', marginBottom: 20, fontSize: 15, lineHeight: 22 },
});