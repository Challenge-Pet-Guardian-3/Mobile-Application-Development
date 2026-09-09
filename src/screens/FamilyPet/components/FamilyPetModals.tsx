import React from 'react';
import { PetFormModal } from '../../../components/PetFormModal';
import { TaskFormModal } from '../../../components/TaskFormModal';
import { InviteCaregiverModal } from '../../../components/InviteCaregiverModal';
import { ManageCaregiverModal } from './ManageCaregiverModal';
import { useFamilyCare } from '../../../hooks/useFamilyCare';

interface FamilyPetModalsProps {
  familyCare: ReturnType<typeof useFamilyCare>;
}

export function FamilyPetModals({ familyCare }: FamilyPetModalsProps) {
  const { family, modals, actions } = familyCare;

  return (
    <>
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
        pets={family?.pets ?? []}
        isLoading={actions.isCreatingTask || actions.isUpdatingTask}
        onSubmit={modals.submeterTarefa}
      />

      {/* Modal de Convidar Co-Cuidador Reutilizável */}
      <InviteCaregiverModal
        visible={modals.ativo === 'convite'}
        onClose={modals.fechar}
        pets={family?.petsOndeSouPrincipal ?? []}
        isLoading={actions.isInvitingCaregiver}
        onSubmit={actions.convidarCuidador}
      />

      {/* Modal de Gestão / Remoção / Transferência de Co-Cuidador */}
      <ManageCaregiverModal
        visible={modals.ativo === 'gerenciarCuidador'}
        onClose={modals.fecharGerenciamento}
        cuidador={modals.cuidadorEmGestao}
        petsOndeSouPrincipal={family?.petsOndeSouPrincipal ?? []}
        onTogglePetVinculo={modals.togglePetVinculo}
        onTransferirTitularidade={modals.transferirTitularidade}
        onRemoverDeTodosPets={modals.removerDeTodosPets}
        isLoading={modals.isLoadingGerenciamento}
      />
    </>
  );
}
