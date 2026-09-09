import React from 'react';
import { PetFormModal } from '../../../components/PetFormModal';
import { InviteCaregiverModal } from '../../../components/InviteCaregiverModal';
import { HistoricoFormModal } from '../../../components/HistoricoFormModal';
import { usePetDetail } from '../../../hooks/usePetDetail';

interface PetDetailModalsProps {
  petDetail: ReturnType<typeof usePetDetail>;
}

export function PetDetailModals({ petDetail }: PetDetailModalsProps) {
  const { pet, modals, actions } = petDetail;

  return (
    <>
      {/* Modal de Edição de Ficha do Pet */}
      <PetFormModal
        visible={modals.edicaoVisivel}
        onClose={() => modals.setEdicaoVisivel(false)}
        mode="edit"
        title={pet?.editTitle ?? 'Editar Ficha do Pet'}
        subtitle="Atualize os dados e informações cadastrais do animal"
        initialData={pet?.initialData}
        isLoading={actions.isUpdatingPet}
        onSubmit={modals.salvarEdicao}
      />

      {/* Modal de Convidar Cuidador para o Pet */}
      <InviteCaregiverModal
        visible={modals.conviteVisivel}
        onClose={() => modals.setConviteVisivel(false)}
        pets={pet?.active ? [pet.active] : (pet?.list ?? [])}
        initialPetId={pet?.active?.id}
        isLoading={actions.isInvitingCaregiver}
        onSubmit={modals.convidarCuidador}
      />

      {/* Modal de CRUD de Registro de Saúde / Histórico */}
      {pet?.active && (
        <HistoricoFormModal
          visible={modals.historicoVisivel}
          onClose={() => modals.setHistoricoVisivel(false)}
          mode={modals.itemEdicaoHistorico ? 'edit' : 'create'}
          petId={pet.active.id}
          initialData={modals.itemEdicaoHistorico}
          isLoading={actions.isSavingHistorico}
          onSubmit={modals.salvarHistorico}
        />
      )}
    </>
  );
}
