import React, { useState } from 'react';
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
import { shadows } from '../../utils/shadow';
import { LoadingSpinner } from '../../components/LoadingSpinner';
import { PetFormModal } from '../../components/PetFormModal';
import { TaskFormModal } from '../../components/TaskFormModal';
import { InviteCaregiverModal } from '../../components/InviteCaregiverModal';
import { PetCard } from '../../components/PetCard';
import { CaregiverCard } from '../../components/CaregiverCard';
import { FamilySummaryCard } from '../../components/FamilySummaryCard';
import { FamilyTaskItem } from '../../components/FamilyTaskItem';
import { useFamilyCare } from '../../hooks/useFamilyCare';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { FamilyStackParamList } from '../../routes/types';

interface FamilyPetScreenProps {
  navigation: NativeStackNavigationProp<FamilyStackParamList>;
}

export default function FamilyPetScreen({ navigation }: FamilyPetScreenProps) {
  const {
    user,
    pets,
    tasks,
    redeCuidado,
    isLoading,
    isFetching,
    refetchAll,
    cadastrarPet,
    cadastrarTarefa,
    convidarCuidador,
    removerTarefa,
    isCreatingPet,
    isCreatingTask,
    isInvitingCaregiver,
  } = useFamilyCare();

  const coCuidadores = redeCuidado?.coCuidadores || [];

  // Modais
  const [modalNovoPet, setModalNovoPet] = useState(false);
  const [modalNovaTarefa, setModalNovaTarefa] = useState(false);
  const [modalConvite, setModalConvite] = useState(false);

  if (isLoading) {
    return <LoadingSpinner message="Carregando rede da família..." />;
  }

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isFetching && !isLoading}
            onRefresh={refetchAll}
            tintColor="#10B981"
          />
        }
      >
        <Header subtitle="Cuidado Familiar & Pets" />

        {/* Resumo da Rede de Cuidado */}
        <FamilySummaryCard
          tutorNome={user?.nome}
          petsCount={pets.length}
          tarefasPendentes={redeCuidado?.totalTarefasPendentes ?? tasks.length}
          tarefasConcluidas={redeCuidado?.totalTarefasConcluidas ?? 0}
          pontosAcumulados={redeCuidado?.pontosAcumulados || 0}
        />

        {/* Seção de Animais da Família */}
        <View style={styles.sectionBox}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Animais da Família</Text>
            <TouchableOpacity style={styles.btnAddPet} onPress={() => setModalNovoPet(true)}>
              <Ionicons name="add" size={16} color="#FFFFFF" />
              <Text style={styles.btnAddPetText}>Adicionar Pet</Text>
            </TouchableOpacity>
          </View>

          {pets.length === 0 ? (
            <View style={styles.emptyBox}>
              <MaterialCommunityIcons name="paw-off" size={28} color="#CBD5E1" />
              <Text style={styles.emptyTitle}>Nenhum pet cadastrado</Text>
              <Text style={styles.emptySub}>Clique no botão acima para adicionar o primeiro pet!</Text>
            </View>
          ) : (
            <View style={styles.petsGrid}>
              {pets.map((pet) => {
                const petResumo = redeCuidado?.pets?.find((p) => p.id === pet.id);
                const isRespPrincipal = petResumo ? petResumo.responsavelPrincipal : true;

                return (
                  <PetCard
                    key={pet.id}
                    pet={pet}
                    isResponsavelPrincipal={isRespPrincipal}
                    onPress={() => navigation.navigate('PetDetail', { petId: pet.id })}
                  />
                );
              })}
            </View>
          )}
        </View>

        {/* Seção de Tarefas da Rotina */}
        <View style={styles.sectionBox}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Rotina & Tarefas</Text>
            <TouchableOpacity
              style={styles.btnAddTask}
              onPress={() => setModalNovaTarefa(true)}
            >
              <Ionicons name="add" size={16} color="#FFFFFF" />
              <Text style={styles.btnAddTaskText}>Nova Tarefa</Text>
            </TouchableOpacity>
          </View>

          {tasks.length === 0 ? (
            <View style={styles.emptyBox}>
              <Ionicons name="checkbox-outline" size={28} color="#CBD5E1" />
              <Text style={styles.emptyTitle}>Nenhuma tarefa ativa</Text>
              <Text style={styles.emptySub}>Crie rotinas diárias para seu pet acumular pontos XP!</Text>
            </View>
          ) : (
            <View style={{ gap: 8 }}>
              {tasks.map((t) => {
                const petName = pets.find((p) => p.id === t.petId)?.nome || 'Pet';
                return (
                  <FamilyTaskItem
                    key={t.id}
                    tarefa={t}
                    petNome={petName}
                    onDelete={removerTarefa}
                  />
                );
              })}
            </View>
          )}
        </View>

        {/* Seção de Co-Cuidadores */}
        <View style={styles.sectionBox}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Co-Cuidadores</Text>
            <TouchableOpacity
              style={styles.btnInvite}
              onPress={() => setModalConvite(true)}
            >
              <Ionicons name="person-add" size={14} color="#2563EB" />
              <Text style={styles.btnInviteText}>Convidar</Text>
            </TouchableOpacity>
          </View>

          {/* Meu perfil */}
          {user && (
            <CaregiverCard
              nome={user.nome || 'Tutor'}
              roleText="Responsável Principal"
              isCurrentUser
              isPrincipal
            />
          )}

          {/* Co-cuidadores */}
          {coCuidadores.map((c) => {
            const petsDoCuidador = c.petIds
              ?.map((pId) => pets.find((p) => p.id === pId)?.nome)
              .filter(Boolean)
              .join(', ');

            return (
              <CaregiverCard
                key={c.id}
                nome={c.nome}
                email={c.email}
                roleText={petsDoCuidador ? `Ajuda com: ${petsDoCuidador}` : 'Co-cuidador'}
                isPrincipal={c.responsavelPrincipal}
              />
            );
          })}
        </View>

        <View style={{ height: 110 }} />
      </ScrollView>

      {/* Modal de Cadastro de Pet Reutilizável */}
      <PetFormModal
        visible={modalNovoPet}
        onClose={() => setModalNovoPet(false)}
        mode="create"
        isLoading={isCreatingPet}
        onSubmit={(data) => cadastrarPet(data, { onSuccess: () => setModalNovoPet(false) })}
      />

      {/* Modal de Criação de Tarefa Reutilizável */}
      <TaskFormModal
        visible={modalNovaTarefa}
        onClose={() => setModalNovaTarefa(false)}
        pets={pets}
        isLoading={isCreatingTask}
        onSubmit={(data) => cadastrarTarefa(data, { onSuccess: () => setModalNovaTarefa(false) })}
      />

      {/* Modal de Convidar Co-Cuidador Reutilizável */}
      <InviteCaregiverModal
        visible={modalConvite}
        onClose={() => setModalConvite(false)}
        pets={pets}
        isLoading={isInvitingCaregiver}
        onSubmit={(data) => convidarCuidador(data, { onSuccess: () => setModalConvite(false) })}
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
  btnAddTask: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#10B981', paddingVertical: 6, paddingHorizontal: 12, borderRadius: 12, gap: 4 },
  btnAddTaskText: { color: '#FFFFFF', fontWeight: '800', fontSize: 12 },
  btnInvite: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#EFF6FF', paddingVertical: 6, paddingHorizontal: 12, borderRadius: 12, gap: 4 },
  btnInviteText: { color: '#2563EB', fontWeight: '800', fontSize: 12 },
  emptyBox: { alignItems: 'center', padding: 20, gap: 4 },
  emptyTitle: { fontSize: 14, fontWeight: '700', color: '#475569' },
  emptySub: { fontSize: 12, color: '#94A3B8', textAlign: 'center' },
  petsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
});