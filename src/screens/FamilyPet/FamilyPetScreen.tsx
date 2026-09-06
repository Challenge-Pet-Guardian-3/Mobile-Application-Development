import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { Header } from '../../components/Header';
import { PetCard } from '../../components/PetCard';
import { CaregiverCard } from '../../components/CaregiverCard';
import { PetFormModal } from '../../components/PetFormModal';
import { TaskFormModal } from '../../components/TaskFormModal';
import { InviteCaregiverModal } from '../../components/InviteCaregiverModal';
import { ManageCaregiverModal } from '../../components/ManageCaregiverModal';
import { FamilySummaryCard } from '../../components/FamilySummaryCard';
import { LoadingSpinner } from '../../components/LoadingSpinner';
import { TasksRoutineSection } from '../../components/TasksRoutineSection';
import { shadows } from '../../utils/shadow';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { FamilyStackParamList } from '../../routes/types';
import { useFamilyCare } from '../../hooks/useFamilyCare';

interface FamilyPetScreenProps {
  navigation: NativeStackNavigationProp<FamilyStackParamList>;
}

export default function FamilyPetScreen({ navigation }: FamilyPetScreenProps) {
  const { status, family, modals, actions } = useFamilyCare();

  if (status.isLoading) {
    return <LoadingSpinner message="Carregando rede da família..." />;
  }

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={status.isFetching && !status.isLoading}
            onRefresh={status.refetchAll}
            tintColor="#10B981"
          />
        }
      >
        <Header subtitle="Cuidado Familiar & Pets" />

        {/* Resumo da Rede de Cuidado */}
        <FamilySummaryCard
          tutorNome={family.user?.nome}
          petsCount={family.pets.length}
          tarefasPendentes={
            family.redeCuidado?.totalTarefasPendentes ??
            family.allTasks.filter((t) => t.status === 'PENDENTE').length
          }
          tarefasConcluidas={family.redeCuidado?.totalTarefasConcluidas ?? 0}
          pontosAcumulados={family.redeCuidado?.pontosAcumulados || 0}
        />

        {/* Seção de Animais da Família */}
        <View style={styles.sectionBox}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Animais da Família</Text>
            <TouchableOpacity style={styles.btnAddPet} onPress={() => modals.abrir('novoPet')}>
              <Ionicons name="add" size={16} color="#FFFFFF" />
              <Text style={styles.btnAddPetText}>Adicionar Pet</Text>
            </TouchableOpacity>
          </View>

          {family.pets.length === 0 ? (
            <View style={styles.emptyBox}>
              <MaterialCommunityIcons name="paw-off" size={28} color="#CBD5E1" />
              <Text style={styles.emptyTitle}>Nenhum pet cadastrado</Text>
              <Text style={styles.emptySub}>Clique no botão acima para adicionar o primeiro pet!</Text>
            </View>
          ) : (
            <View style={styles.petsGrid}>
              {family.pets.map((pet) => {
                const petResumo = family.redeCuidado?.pets?.find((p) => p.id === pet.id);
                const isRespPrincipal = petResumo ? petResumo.responsavelPrincipal : true;

                return (
                  <PetCard
                    key={pet.id}
                    pet={pet}
                    isResponsavelPrincipal={isRespPrincipal}
                    tarefasCount={petResumo?.tarefaIds?.length}
                    onPress={() => navigation.navigate('PetDetail', { petId: pet.id })}
                  />
                );
              })}
            </View>
          )}
        </View>

        {/* Seção Reutilizável de Tarefas da Rotina */}
        <TasksRoutineSection
          title={family.filtroRotina === 'HOJE' ? 'Rotina de Hoje' : 'Rotina & Tarefas'}
          subtitle={`${family.tasks.length} ${family.tasks.length === 1 ? 'tarefa' : 'tarefas'} ${family.filtroRotina === 'HOJE' ? 'hoje' : 'no total'}`}
          filter={family.filtroRotina}
          onFilterChange={family.setFiltroRotina}
          countHoje={family.totalTarefasHoje}
          countTodas={family.totalTarefasGeral}
          tasks={family.tasks}
          pets={family.pets}
          headerButton={{
            label: 'Nova Tarefa',
            icon: 'add',
            variant: 'primary',
            onPress: () => modals.abrir('novaTarefa'),
          }}
          emptyTitle={family.filtroRotina === 'HOJE' ? 'Tudo em dia para hoje!' : 'Nenhuma tarefa ativa'}
          emptyDesc={
            family.filtroRotina === 'HOJE'
              ? 'Nenhuma tarefa agendada para hoje na família.'
              : 'Crie rotinas diárias para seu pet acumular pontos XP!'
          }
          onEditTask={modals.abrirEdicaoTarefa}
          onDeleteTask={actions.removerTarefa}
        />

        {/* Seção de Co-Cuidadores */}
        <View style={styles.sectionBox}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Co-Cuidadores</Text>
            {family.petsOndeSouPrincipal.length > 0 && (
              <TouchableOpacity
                style={styles.btnInvite}
                onPress={modals.abrirConvite}
              >
                <Ionicons name="person-add" size={14} color="#2563EB" />
                <Text style={styles.btnInviteText}>Convidar</Text>
              </TouchableOpacity>
            )}
          </View>

          {/* Meu perfil */}
          {family.user && (
            <CaregiverCard
              nome={family.user.nome || 'Tutor'}
              roleText="Responsável Principal"
              isCurrentUser
              isPrincipal
            />
          )}

          {/* Co-cuidadores */}
          {family.coCuidadores.map((c) => {
            const petsDoCuidador = c.petIds
              ?.map((pId) => family.pets.find((p) => p.id === pId)?.nome)
              .filter(Boolean)
              .join(', ');

            return (
              <CaregiverCard
                key={c.id}
                nome={c.nome}
                email={c.email}
                roleText={petsDoCuidador ? `Ajuda com: ${petsDoCuidador}` : 'Co-cuidador'}
                isPrincipal={c.responsavelPrincipal}
                onPress={
                  family.petsOndeSouPrincipal.length > 0
                    ? () => modals.abrirGerenciamento(c)
                    : undefined
                }
              />
            );
          })}
        </View>

        <View style={{ height: 110 }} />
      </ScrollView>

      {/* Modal de Criação de Pet Reutilizável */}
      <PetFormModal
        visible={modals.ativo === 'novoPet'}
        onClose={modals.fechar}
        mode="create"
        isLoading={actions.isCreatingPet}
        onSubmit={(data) => actions.cadastrarPet(data, { onSuccess: modals.fechar })}
      />

      {/* Modal de Criação / Edição de Tarefa Reutilizável */}
      <TaskFormModal
        visible={modals.ativo === 'novaTarefa' || modals.ativo === 'editarTarefa'}
        onClose={modals.fecharModalTarefa}
        mode={modals.ativo === 'editarTarefa' ? 'edit' : 'create'}
        initialData={modals.initialTaskData}
        pets={family.pets}
        isLoading={actions.isCreatingTask || actions.isUpdatingTask}
        onSubmit={modals.submeterTarefa}
      />

      {/* Modal de Convidar Co-Cuidador Reutilizável */}
      <InviteCaregiverModal
        visible={modals.ativo === 'convite'}
        onClose={modals.fechar}
        pets={family.petsOndeSouPrincipal}
        isLoading={actions.isInvitingCaregiver}
        onSubmit={(data) => actions.convidarCuidador(data, { onSuccess: modals.fechar })}
      />

      {/* Modal de Gestão / Remoção / Transferência de Co-Cuidador */}
      <ManageCaregiverModal
        visible={modals.ativo === 'gerenciarCuidador'}
        onClose={modals.fecharGerenciamento}
        cuidador={modals.cuidadorEmGestao}
        petsOndeSouPrincipal={family.petsOndeSouPrincipal}
        onTogglePetVinculo={modals.togglePetVinculo}
        onTransferirTitularidade={modals.transferirTitularidade}
        onRemoverDeTodosPets={modals.removerDeTodosPets}
        isLoading={modals.isLoadingGerenciamento}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  scrollContent: { paddingHorizontal: 20, paddingTop: 10, gap: 16 },
  sectionBox: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(226, 232, 240, 0.8)',
    ...shadows.sm,
    elevation: 2,
  },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 },
  sectionTitle: { fontSize: 16, fontWeight: '800', color: '#0F172A' },
  btnAddPet: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#10B981', paddingVertical: 6, paddingHorizontal: 12, borderRadius: 12, gap: 4 },
  btnAddPetText: { color: '#FFFFFF', fontWeight: '800', fontSize: 12 },
  btnInvite: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#EFF6FF', paddingVertical: 6, paddingHorizontal: 12, borderRadius: 12, gap: 4 },
  btnInviteText: { color: '#2563EB', fontWeight: '800', fontSize: 12 },
  emptyBox: { alignItems: 'center', padding: 20, gap: 4 },
  emptyTitle: { fontSize: 14, fontWeight: '700', color: '#475569' },
  emptySub: { fontSize: 12, color: '#94A3B8', textAlign: 'center' },
  petsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
});