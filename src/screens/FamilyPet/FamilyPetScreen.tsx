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
import { colors, spacing, borderRadius } from '../../constants/theme';

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
        keyboardShouldPersistTaps="handled"
        refreshControl={
          <RefreshControl
            refreshing={status.isFetching && !status.isLoading}
            onRefresh={status.refetchAll}
            tintColor={colors.success.default}
          />
        }
      >
        <Header subtitle="Cuidado Familiar & Pets" />

        {/* Resumo da Rede de Cuidado */}
        <FamilySummaryCard {...family.summary} />

        {/* Seção de Animais da Família */}
        <View style={styles.sectionBox}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Animais da Família</Text>
            <TouchableOpacity style={styles.btnAddPet} onPress={() => modals.abrir('novoPet')}>
              <Ionicons name="add" size={16} color={colors.neutral.white} />
              <Text style={styles.btnAddPetText}>Adicionar Pet</Text>
            </TouchableOpacity>
          </View>

          {family.pets.length === 0 ? (
            <View style={styles.emptyBox}>
              <MaterialCommunityIcons name="paw-off" size={28} color={colors.neutral[300]} />
              <Text style={styles.emptyTitle}>Nenhum pet cadastrado</Text>
              <Text style={styles.emptySub}>Clique no botão acima para adicionar o primeiro pet!</Text>
            </View>
          ) : (
            <View style={styles.petsGrid}>
              {family.petsComMetadados.map((pet) => (
                <PetCard
                  key={pet.id}
                  pet={pet}
                  isResponsavelPrincipal={pet.isResponsavelPrincipal}
                  tarefasCount={pet.tarefasCount}
                  pontosTotais={pet.pontosTotais}
                  onPress={() => navigation.navigate('PetDetail', { petId: pet.id })}
                />
              ))}
            </View>
          )}
        </View>

        {/* Seção Reutilizável de Tarefas da Rotina */}
        <TasksRoutineSection
          title={family.routineTexts.title}
          subtitle={family.routineTexts.subtitle}
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
          emptyTitle={family.routineTexts.emptyTitle}
          emptyDesc={family.routineTexts.emptyDesc}
          onToggleTask={actions.alternarStatusTarefa}
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
          {family.coCuidadores.map((c) => (
            <CaregiverCard
              key={c.id}
              nome={c.nome}
              email={c.email}
              roleText={c.roleText}
              isPrincipal={c.responsavelPrincipal}
              onPress={
                family.petsOndeSouPrincipal.length > 0
                  ? () => modals.abrirGerenciamento(c)
                  : undefined
              }
            />
          ))}
        </View>

        <View style={{ height: 110 }} />
      </ScrollView>

      {/* Modal de Criação de Pet Reutilizável */}
      <PetFormModal
        visible={modals.ativo === 'novoPet'}
        onClose={modals.fechar}
        mode="create"
        isLoading={actions.isCreatingPet}
        onSubmit={actions.cadastrarPet}
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
        onSubmit={actions.convidarCuidador}
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
  container: {
    flex: 1,
    backgroundColor: colors.neutral[50],
  },
  scrollContent: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xs,
    gap: spacing.md,
  },
  sectionBox: {
    backgroundColor: colors.neutral.white,
    borderRadius: borderRadius.xxl,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: 'rgba(226, 232, 240, 0.8)',
    ...shadows.sm,
    elevation: 2,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.neutral[900],
  },
  btnAddPet: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.success.default,
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
    borderRadius: borderRadius.md,
    gap: 4,
  },
  btnAddPetText: {
    color: colors.neutral.white,
    fontWeight: '800',
    fontSize: 12,
  },
  btnInvite: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary[50],
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
    borderRadius: borderRadius.md,
    gap: 4,
  },
  btnInviteText: {
    color: colors.primary[600],
    fontWeight: '800',
    fontSize: 12,
  },
  emptyBox: {
    alignItems: 'center',
    padding: spacing.lg,
    gap: 4,
  },
  emptyTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.neutral[600],
  },
  emptySub: {
    fontSize: 12,
    color: colors.neutral[400],
    textAlign: 'center',
  },
  petsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
});