import React from 'react';
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
import { EditProfileModal } from '../../components/EditProfileModal';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useUserProfile } from '../../hooks/useUserProfile';
import { RootStackParamList } from '../../routes/types';

interface UserProfileScreenProps {
  navigation: NativeStackNavigationProp<RootStackParamList>;
}

export default function UserProfileScreen({ navigation }: UserProfileScreenProps) {
  const { profile, modals, actions } = useUserProfile();
  const { user, initials, enderecoPrincipal, pontosTotais, redeCuidado } = profile;

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

          <TouchableOpacity style={styles.btnEditProfile} onPress={() => modals.abrir('editar')} activeOpacity={0.8}>
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
                {redeCuidado?.pets?.length || 0} {redeCuidado?.pets?.length === 1 ? 'animal cadastrado' : 'animais cadastrados'}
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
            style={[styles.menuItem, { borderBottomWidth: 0 }]}
            onPress={() => navigation.navigate('IA')}
            activeOpacity={0.7}
          >
            <View style={[styles.menuIconWrapper, { backgroundColor: '#EFF6FF' }]}>
              <MaterialCommunityIcons name="robot-outline" size={20} color="#2563EB" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.menuText}>Assistente de IA Preventiva</Text>
              <Text style={styles.menuSubText}>Orientações sobre saúde e rotina do pet</Text>
            </View>
            <Ionicons name="chevron-forward" size={16} color="#CBD5E1" />
          </TouchableOpacity>
        </View>

        {/* Suporte, Termos & Conta */}
        <View style={styles.menuBox}>
          <Text style={styles.menuSectionTitle}>Conta & Suporte</Text>

          <TouchableOpacity style={styles.menuItem} onPress={() => modals.abrir('faq')} activeOpacity={0.7}>
            <View style={[styles.menuIconWrapper, { backgroundColor: '#F1F5F9' }]}>
              <Ionicons name="help-circle-outline" size={20} color="#475569" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.menuText}>Perguntas Frequentes (FAQ)</Text>
              <Text style={styles.menuSubText}>Dúvidas sobre o funcionamento</Text>
            </View>
            <Ionicons name="chevron-forward" size={16} color="#CBD5E1" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuItem} onPress={() => modals.abrir('termos')} activeOpacity={0.7}>
            <View style={[styles.menuIconWrapper, { backgroundColor: '#F1F5F9' }]}>
              <Ionicons name="document-text-outline" size={20} color="#475569" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.menuText}>Termos de Uso & Privacidade</Text>
              <Text style={styles.menuSubText}>Diretrizes do ecossistema Clyvo</Text>
            </View>
            <Ionicons name="chevron-forward" size={16} color="#CBD5E1" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuItem} onPress={actions.logout} activeOpacity={0.7}>
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
            onPress={actions.excluirConta}
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
        visible={modals.ativo === 'editar'}
        onClose={modals.fechar}
        initialData={modals.initialFormData}
        isLoading={actions.isUpdating}
        onSubmit={actions.salvarPerfil}
      />

      <FaqModal visible={modals.ativo === 'faq'} onClose={modals.fechar} />

      <TermsModal visible={modals.ativo === 'termos'} onClose={modals.fechar} />
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
  },
  avatarContainer: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#059669',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
    borderWidth: 3,
    borderColor: '#ECFDF5',
  },
  avatarInitials: { color: '#FFFFFF', fontSize: 24, fontWeight: '800' },
  userName: { fontSize: 20, fontWeight: '800', color: '#0F172A', marginBottom: 2 },
  userEmail: { fontSize: 13, color: '#64748B', fontWeight: '500', marginBottom: 10 },
  roleBadgeBox: { marginBottom: 12 },
  infoPillsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    justifyContent: 'center',
    marginBottom: 16,
  },
  infoPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  infoPillText: { fontSize: 12, color: '#475569', fontWeight: '600' },
  btnEditProfile: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 14,
  },
  btnEditProfileText: { color: '#2563EB', fontSize: 12, fontWeight: '700' },
  statsRow: { flexDirection: 'row', gap: 10 },
  menuBox: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(226, 232, 240, 0.8)',
    ...shadows.sm,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  menuSectionTitle: { fontSize: 15, fontWeight: '700', color: '#0F172A', marginBottom: 12 },
  linkHeader: { fontSize: 13, color: '#2563EB', fontWeight: '600', marginBottom: 12 },
  familySummary: {
    flexDirection: 'row',
    backgroundColor: '#F8FAFC',
    borderRadius: 14,
    padding: 12,
    justifyContent: 'space-around',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  familyItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  familyItemText: { fontSize: 13, fontWeight: '600', color: '#334155' },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
    gap: 12,
  },
  menuIconWrapper: {
    width: 36,
    height: 36,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  menuText: { fontSize: 14, fontWeight: '600', color: '#1E293B' },
  menuSubText: { fontSize: 11, color: '#94A3B8', marginTop: 1 },
});