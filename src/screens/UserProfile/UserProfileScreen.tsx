import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Platform,
  Alert,
  Switch,
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { Header } from '../../components/Header';
import { useSession } from '../../hooks/useSession';
import { useUserPoints } from '../../hooks/useTasks';
import { useRedeCuidado } from '../../hooks/useRedeCuidado';
import { RoleBadge } from '../../components/RoleBadge';
import { StatCard } from '../../components/StatCard';
import { BaseModal } from '../../components/BaseModal';
import { EditProfileModal, EditProfileFormData } from '../../components/EditProfileModal';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useUpdateUser, useDeleteUser } from '../../hooks/useUsers';

interface UserProfileScreenProps {
  navigation: NativeStackNavigationProp<any>;
}

export default function UserProfileScreen({ navigation }: UserProfileScreenProps) {
  const { user, logout } = useSession();
  const { data: pontosTotais } = useUserPoints(user?.id);
  const { data: redeCuidado } = useRedeCuidado(user?.id);

  const updateUserMutation = useUpdateUser();
  const deleteUserMutation = useDeleteUser();

  // Modais
  const [modalEditarPerfil, setModalEditarPerfil] = useState(false);
  const [modalFaq, setModalFaq] = useState(false);
  const [modalTermos, setModalTermos] = useState(false);

  // Switches de Preferências
  const [notificacoesAtivas, setNotificacoesAtivas] = useState(true);
  const [lembretesSaude, setLembretesSaude] = useState(true);

  const editProfileInitialData: EditProfileFormData = {
    nome: user?.nome || '',
    email: user?.email || '',
    senha: '',
    ddd: user?.ddd || '',
    numeroTelefone: user?.numeroTelefone || '',
    role: user?.role || 'PREMIUM',
    cep: user?.enderecos && user.enderecos.length > 0 ? user.enderecos[0].cep : '',
    numero: user?.enderecos && user.enderecos.length > 0 ? user.enderecos[0].numero : '',
  };

  const handleAbrirEdicao = useCallback(() => {
    setModalEditarPerfil(true);
  }, []);

  // Salvar alterações na API Java (PUT /usuarios/{id})
  const handleSalvarPerfil = useCallback(async (formEdit: EditProfileFormData) => {
    if (!user) return;
    if (!formEdit.nome.trim() || !formEdit.email.trim()) {
      Alert.alert('Campos obrigatórios', 'Por favor, informe seu nome e e-mail.');
      return;
    }

    try {
      await updateUserMutation.mutateAsync({
        id: user.id,
        data: {
          nome: formEdit.nome.trim(),
          email: formEdit.email.trim().toLowerCase(),
          senha: formEdit.senha?.trim() || '',
          ddd: formEdit.ddd.replace(/\D/g, ''),
          numeroTelefone: formEdit.numeroTelefone.replace(/\D/g, ''),
          role: formEdit.role || 'PREMIUM',
          endereco: {
            cep: formEdit.cep.replace(/\D/g, ''),
            numero: formEdit.numero.trim(),
          },
        },
      });

      setModalEditarPerfil(false);
      Alert.alert('Sucesso!', 'Dados do perfil atualizados com sucesso.');
    } catch {
      Alert.alert('Erro', 'Não foi possível atualizar seus dados na API.');
    }
  }, [user, updateUserMutation]);

  // Logout com confirmação
  const handleLogout = useCallback(() => {
    Alert.alert('Sair da Conta', 'Deseja realmente encerrar sua sessão no PetGuardian?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Sair',
        style: 'destructive',
        onPress: async () => {
          await logout();
        },
      },
    ]);
  }, [logout]);

  // Excluir conta com confirmação
  const handleExcluirConta = useCallback(() => {
    if (!user) return;
    Alert.alert(
      'Excluir Conta',
      'Tem certeza de que deseja apagar permanentemente sua conta e todos os dados associados? Esta ação não pode ser desfeita.',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Excluir Definitivamente',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteUserMutation.mutateAsync(user.id);
            } catch {
              Alert.alert('Erro', 'Não foi possível excluir a conta.');
            }
          },
        },
      ]
    );
  }, [user, deleteUserMutation]);

  const initials = (user?.nome || 'TU').substring(0, 2).toUpperCase();
  const enderecoPrincipal = user?.enderecos && user.enderecos.length > 0 ? user.enderecos[0] : null;

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <Header subtitle="Meu Perfil & Configurações" />

        {/* Card do Perfil do Usuário com Informações Detalhadas */}
        <View style={styles.profileCard}>
          <View style={styles.avatarContainer}>
            <Text style={styles.avatarInitials}>{initials}</Text>
          </View>
          <Text style={styles.userName}>{user?.nome || 'Tutor Responsável'}</Text>
          <Text style={styles.userEmail}>{user?.email || 'email@petguardian.com'}</Text>

          <View style={styles.roleBadgeBox}>
            <RoleBadge role={user?.role} />
          </View>

          <View style={styles.infoPillsRow}>
            <View style={styles.infoPill}>
              <Ionicons name="call-outline" size={12} color="#64748B" />
              <Text style={styles.infoPillText}>
                ({user?.ddd || '11'}) {user?.numeroTelefone || '98765-4321'}
              </Text>
            </View>

            {enderecoPrincipal && (
              <View style={styles.infoPill}>
                <Ionicons name="location-outline" size={12} color="#64748B" />
                <Text style={styles.infoPillText}>
                  {enderecoPrincipal.bairro || 'São Paulo'} • CEP {enderecoPrincipal.cep}
                </Text>
              </View>
            )}
          </View>

          <TouchableOpacity style={styles.btnEditProfile} onPress={handleAbrirEdicao} activeOpacity={0.8}>
            <Ionicons name="pencil" size={14} color="#2563EB" />
            <Text style={styles.btnEditProfileText}>Editar Dados Cadastrais</Text>
          </TouchableOpacity>
        </View>

        {/* Estatísticas Gamificadas */}
        <View style={styles.statsRow}>
          <StatCard
            iconName="star"
            iconColor="#D97706"
            iconBgColor="#FFF7ED"
            value={pontosTotais !== undefined ? `${pontosTotais}` : '0'}
            label="Pontos XP"
          />
          <StatCard
            iconName="paw"
            iconColor="#2563EB"
            iconBgColor="#EFF6FF"
            value={redeCuidado?.pets?.length ? `${redeCuidado.pets.length}` : '1'}
            label="Pets Família"
          />
          <StatCard
            iconName="check-circle"
            iconColor="#059669"
            iconBgColor="#ECFDF5"
            value={redeCuidado?.totalTarefasConcluidas ? `${redeCuidado.totalTarefasConcluidas}` : '0'}
            label="Concluídas"
          />
        </View>

        {/* Rede Familiar & Cuidadores */}
        <View style={styles.menuBox}>
          <View style={styles.sectionHeaderRow}>
            <Text style={styles.menuSectionTitle}>Rede de Cuidado Familiar</Text>
            <TouchableOpacity onPress={() => navigation.navigate('Family')}>
              <Text style={styles.linkHeader}>Ver todos</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.familySummary}>
            <View style={styles.familyItem}>
              <MaterialCommunityIcons name="paw" size={18} color="#2563EB" />
              <Text style={styles.familyItemText}>
                {redeCuidado?.pets?.length || 0} {(redeCuidado?.pets?.length === 1 ? 'animal cadastrado' : 'animais cadastrados')}
              </Text>
            </View>
            <View style={styles.familyItem}>
              <MaterialCommunityIcons name="account-multiple-outline" size={18} color="#059669" />
              <Text style={styles.familyItemText}>
                {(redeCuidado?.coCuidadores?.length || 0) + 1} cuidadores ativos
              </Text>
            </View>
          </View>
        </View>

        {/* Preferências & Notificações */}
        <View style={styles.menuBox}>
          <Text style={styles.menuSectionTitle}>Preferências do App</Text>

          <View style={styles.switchRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.switchLabel}>Notificações de Rotina</Text>
              <Text style={styles.switchSub}>Lembretes de passeios, remédios e refeições</Text>
            </View>
            <Switch
              value={notificacoesAtivas}
              onValueChange={setNotificacoesAtivas}
              trackColor={{ false: '#CBD5E1', true: '#93C5FD' }}
              thumbColor={notificacoesAtivas ? '#2563EB' : '#F1F5F9'}
            />
          </View>

          <View style={[styles.switchRow, { borderBottomWidth: 0 }]}>
            <View style={{ flex: 1 }}>
              <Text style={styles.switchLabel}>Alertas de Saúde Preventiva</Text>
              <Text style={styles.switchSub}>Recomendações e vacinas sugeridas pela IA</Text>
            </View>
            <Switch
              value={lembretesSaude}
              onValueChange={setLembretesSaude}
              trackColor={{ false: '#CBD5E1', true: '#93C5FD' }}
              thumbColor={lembretesSaude ? '#2563EB' : '#F1F5F9'}
            />
          </View>
        </View>

        {/* Recursos & Ferramentas */}
        <View style={styles.menuBox}>
          <Text style={styles.menuSectionTitle}>Recursos PetGuardian</Text>

          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => navigation.navigate('Clinicas')}
            activeOpacity={0.7}
          >
            <View style={[styles.menuIconWrapper, { backgroundColor: '#FEF2F2' }]}>
              <MaterialCommunityIcons name="hospital-box-outline" size={20} color="#EF4444" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.menuText}>Pronto-Socorro & Clínicas 24h</Text>
              <Text style={styles.menuSubText}>Atendimento emergencial e veterinárias</Text>
            </View>
            <Ionicons name="chevron-forward" size={16} color="#CBD5E1" />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => navigation.navigate('IA')}
            activeOpacity={0.7}
          >
            <View style={[styles.menuIconWrapper, { backgroundColor: '#EFF6FF' }]}>
              <MaterialCommunityIcons name="robot-outline" size={20} color="#2563EB" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.menuText}>Assistente de IA Preventiva</Text>
              <Text style={styles.menuSubText}>Orientações sobre saúde e rotina</Text>
            </View>
            <Ionicons name="chevron-forward" size={16} color="#CBD5E1" />
          </TouchableOpacity>
        </View>

        {/* Suporte, Termos & Conta */}
        <View style={styles.menuBox}>
          <Text style={styles.menuSectionTitle}>Conta & Suporte</Text>

          <TouchableOpacity style={styles.menuItem} onPress={() => setModalFaq(true)} activeOpacity={0.7}>
            <View style={[styles.menuIconWrapper, { backgroundColor: '#F1F5F9' }]}>
              <Ionicons name="help-circle-outline" size={20} color="#475569" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.menuText}>Perguntas Frequentes (FAQ)</Text>
              <Text style={styles.menuSubText}>Dúvidas sobre o funcionamento</Text>
            </View>
            <Ionicons name="chevron-forward" size={16} color="#CBD5E1" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuItem} onPress={() => setModalTermos(true)} activeOpacity={0.7}>
            <View style={[styles.menuIconWrapper, { backgroundColor: '#F1F5F9' }]}>
              <Ionicons name="document-text-outline" size={20} color="#475569" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.menuText}>Termos de Uso & Privacidade</Text>
              <Text style={styles.menuSubText}>Diretrizes do ecossistema Clyvo</Text>
            </View>
            <Ionicons name="chevron-forward" size={16} color="#CBD5E1" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuItem} onPress={handleLogout} activeOpacity={0.7}>
            <View style={[styles.menuIconWrapper, { backgroundColor: '#FEF2F2' }]}>
              <Ionicons name="log-out-outline" size={20} color="#EF4444" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[styles.menuText, { color: '#EF4444' }]}>Encerrar Sessão (Logout)</Text>
              <Text style={styles.menuSubText}>Desconectar deste dispositivo</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.menuItem, { borderBottomWidth: 0 }]}
            onPress={handleExcluirConta}
            activeOpacity={0.7}
          >
            <View style={[styles.menuIconWrapper, { backgroundColor: '#FEF2F2' }]}>
              <Ionicons name="trash-outline" size={20} color="#DC2626" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[styles.menuText, { color: '#DC2626' }]}>Excluir Minha Conta</Text>
              <Text style={styles.menuSubText}>Apagar todos os dados permanentemente</Text>
            </View>
          </TouchableOpacity>
        </View>

        <View style={{ height: 110 }} />
      </ScrollView>

      {/* Modal de Edição de Perfil Reutilizável */}
      <EditProfileModal
        visible={modalEditarPerfil}
        onClose={() => setModalEditarPerfil(false)}
        initialData={editProfileInitialData}
        isLoading={updateUserMutation.isPending}
        onSubmit={handleSalvarPerfil}
      />

      {/* Modal de FAQ */}
      <BaseModal
        visible={modalFaq}
        onClose={() => setModalFaq(false)}
        title="Perguntas Frequentes"
        subtitle="Dúvidas comuns sobre o PetGuardian"
      >
        <View style={styles.faqItem}>
          <Text style={styles.faqQ}>Como os pontos são creditados ao Pet?</Text>
          <Text style={styles.faqA}>
            Ao concluir tarefas diárias na Home ou lições na aba de Trilhas, os pontos são registrados imediatamente na API Java e sobem a barra de bem-estar do pet ativo.
          </Text>
        </View>

        <View style={styles.faqItem}>
          <Text style={styles.faqQ}>Como convidar familiares?</Text>
          <Text style={styles.faqA}>
            Acesse a aba Family Pet e clique no botão "+ Convidar Familiar" informando o e-mail cadastrado.
          </Text>
        </View>

        <View style={styles.faqItem}>
          <Text style={styles.faqQ}>Onde vejo o histórico clínico?</Text>
          <Text style={styles.faqA}>
            Na aba Family Pet, toque no card do animal para abrir a Ficha Completa com todo o histórico consolidado.
          </Text>
        </View>
      </BaseModal>

      {/* Modal de Termos de Uso */}
      <BaseModal
        visible={modalTermos}
        onClose={() => setModalTermos(false)}
        title="Termos & Privacidade"
        subtitle="Diretrizes do ecossistema Clyvo"
      >
        <Text style={styles.termsText}>
          O PetGuardian respeita a privacidade dos dados de sua família e de seus animais de estimação. Todos os registros de saúde e rotina são sincronizados com segurança em nosso backend em nuvem.
        </Text>
        <Text style={[styles.termsText, { marginTop: 10 }]}>
          As recomendações da IA Preventiva possuem caráter orientador e não substituem o diagnóstico de um médico veterinário presencial.
        </Text>
      </BaseModal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC', paddingTop: Platform.OS === 'ios' ? 50 : 25 },
  scrollContent: { paddingHorizontal: 20, paddingTop: 10, gap: 16 },
  profileCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 22,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(226, 232, 240, 0.8)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.03,
    shadowRadius: 10,
    elevation: 2,
  },
  avatarContainer: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#0F172A',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  avatarInitials: { fontSize: 24, fontWeight: '900', color: '#FFFFFF' },
  userName: { fontSize: 20, fontWeight: '900', color: '#0F172A' },
  userEmail: { fontSize: 13, color: '#64748B', marginTop: 2 },
  roleBadgeBox: { marginTop: 8 },
  infoPillsRow: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 6, marginTop: 10 },
  infoPill: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: '#F1F5F9', paddingVertical: 4, paddingHorizontal: 10, borderRadius: 10 },
  infoPillText: { fontSize: 11, color: '#64748B', fontWeight: '600' },
  btnEditProfile: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EFF6FF',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 14,
    gap: 6,
    marginTop: 14,
  },
  btnEditProfileText: { fontSize: 12, fontWeight: '800', color: '#2563EB' },
  statsRow: { flexDirection: 'row', gap: 10 },
  statCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    paddingVertical: 14,
    paddingHorizontal: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(226, 232, 240, 0.8)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.02,
    shadowRadius: 6,
    elevation: 1,
    gap: 4,
  },
  statIconBox: { width: 34, height: 34, borderRadius: 17, justifyContent: 'center', alignItems: 'center', marginBottom: 2 },
  statVal: { fontSize: 16, fontWeight: '900', color: '#0F172A' },
  statLabel: { fontSize: 11, color: '#64748B', fontWeight: '600' },
  menuBox: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 18,
    borderWidth: 1,
    borderColor: 'rgba(226, 232, 240, 0.8)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.03,
    shadowRadius: 10,
    elevation: 2,
  },
  sectionHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  menuSectionTitle: { fontSize: 13, fontWeight: '800', color: '#64748B', marginBottom: 8, textTransform: 'uppercase', letterSpacing: 0.5 },
  linkHeader: { fontSize: 12, fontWeight: '700', color: '#2563EB' },
  familySummary: { flexDirection: 'row', gap: 16, paddingVertical: 4 },
  familyItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  familyItemText: { fontSize: 13, fontWeight: '600', color: '#334155' },
  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  switchLabel: { fontSize: 13, fontWeight: '700', color: '#0F172A' },
  switchSub: { fontSize: 11, color: '#64748B', marginTop: 2 },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  menuIconWrapper: {
    width: 38,
    height: 38,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  menuText: { fontSize: 14, color: '#0F172A', fontWeight: '700' },
  menuSubText: { fontSize: 11, color: '#64748B', marginTop: 1 },
  faqItem: { backgroundColor: '#F8FAFC', padding: 14, borderRadius: 14, marginBottom: 10, borderWidth: 1, borderColor: '#EDF2F7' },
  faqQ: { fontSize: 13, fontWeight: '800', color: '#2563EB', marginBottom: 4 },
  faqA: { fontSize: 12, color: '#475569', lineHeight: 18 },
  termsText: { fontSize: 13, color: '#475569', lineHeight: 20 },
});