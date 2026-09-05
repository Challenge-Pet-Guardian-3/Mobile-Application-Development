import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Platform,
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { Header } from '../../components/Header';
import { RoleBadge } from '../../components/RoleBadge';
import { StatCard } from '../../components/StatCard';
import { FaqModal } from '../../components/FaqModal';
import { TermsModal } from '../../components/TermsModal';
import { shadows } from '../../utils/shadow';
import { EditProfileModal, EditProfileFormData } from '../../components/EditProfileModal';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useUserProfile } from '../../hooks/useUserProfile';
import { RootStackParamList } from '../../routes/types';

interface UserProfileScreenProps {
  navigation: NativeStackNavigationProp<RootStackParamList>;
}

export default function UserProfileScreen({ navigation }: UserProfileScreenProps) {
  const {
    user,
    pontosTotais,
    redeCuidado,
    initialFormData,
    salvarPerfil,
    logoutComConfirmacao,
    excluirContaComConfirmacao,
    isUpdating,
  } = useUserProfile();

  // Modais
  const [modalEditarPerfil, setModalEditarPerfil] = useState(false);
  const [modalFaq, setModalFaq] = useState(false);
  const [modalTermos, setModalTermos] = useState(false);

  const handleAbrirEdicao = useCallback(() => {
    setModalEditarPerfil(true);
  }, []);

  const handleSalvarPerfil = useCallback(
    (formEdit: EditProfileFormData) => {
      salvarPerfil(formEdit, {
        onSuccess: () => setModalEditarPerfil(false),
      });
    },
    [salvarPerfil]
  );

  const initials = (user?.nome || 'TU').substring(0, 2).toUpperCase();
  const enderecoPrincipal = user?.enderecos?.[0] ?? null;

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
          {user?.email ? <Text style={styles.userEmail}>{user.email}</Text> : null}

          <View style={styles.roleBadgeBox}>
            <RoleBadge role={user?.role} />
          </View>

          <View style={styles.infoPillsRow}>
            {user?.ddd && user?.numeroTelefone ? (
              <View style={styles.infoPill}>
                <Ionicons name="call-outline" size={12} color="#64748B" />
                <Text style={styles.infoPillText}>
                  ({user.ddd}) {user.numeroTelefone}
                </Text>
              </View>
            ) : null}

            {enderecoPrincipal && (
              <View style={styles.infoPill}>
                <Ionicons name="location-outline" size={12} color="#64748B" />
                <Text style={styles.infoPillText}>
                  {enderecoPrincipal.bairro ? `${enderecoPrincipal.bairro} • ` : ''}CEP {enderecoPrincipal.cep}
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
            value={redeCuidado?.pets?.length ? `${redeCuidado.pets.length}` : '0'}
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

          <TouchableOpacity style={styles.menuItem} onPress={logoutComConfirmacao} activeOpacity={0.7}>
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
            onPress={excluirContaComConfirmacao}
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
        initialData={initialFormData}
        isLoading={isUpdating}
        onSubmit={handleSalvarPerfil}
      />

      <FaqModal visible={modalFaq} onClose={() => setModalFaq(false)} />

      <TermsModal visible={modalTermos} onClose={() => setModalTermos(false)} />
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
    ...shadows.sm,
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
    ...shadows.lg,
    elevation: 3,
  },
  avatarInitials: { fontSize: 24, fontWeight: '900', color: '#FFFFFF' },
  userName: { fontSize: 20, fontWeight: '900', color: '#0F172A' },
  userEmail: { fontSize: 13, color: '#64748B', marginTop: 2 },
  roleBadgeBox: { marginTop: 8 },
  infoPillsRow: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 6, marginTop: 10 },
  infoPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
  },
  infoPillText: { fontSize: 11, fontWeight: '600', color: '#475569' },
  btnEditProfile: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 16,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 14,
    backgroundColor: '#EFF6FF',
    borderWidth: 1,
    borderColor: '#BFDBFE',
  },
  btnEditProfileText: { fontSize: 13, fontWeight: '800', color: '#2563EB' },
  statsRow: { flexDirection: 'row', gap: 10 },
  menuBox: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 18,
    borderWidth: 1,
    borderColor: 'rgba(226, 232, 240, 0.8)',
    ...shadows.sm,
    elevation: 2,
  },
  sectionHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  menuSectionTitle: { fontSize: 13, fontWeight: '800', color: '#64748B', marginBottom: 8, textTransform: 'uppercase', letterSpacing: 0.5 },
  linkHeader: { fontSize: 12, fontWeight: '700', color: '#2563EB' },
  familySummary: { flexDirection: 'row', gap: 16, paddingVertical: 4 },
  familyItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  familyItemText: { fontSize: 13, fontWeight: '600', color: '#334155' },
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
});