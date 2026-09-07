import React, { useState, useCallback, memo } from 'react';
import { View, StyleSheet, Alert } from 'react-native';
import { BaseModal } from '../BaseModal';
import { CustomInput } from '../CustomInput';
import { CustomButton } from '../CustomButton';
import { PetSelector } from '../PetSelector';
import { InviteCaregiverSchema, formatZodError } from '../../utils/schemas';

export interface InviteCaregiverData {
  email: string;
  petId: number;
}

interface InviteCaregiverModalProps {
  visible: boolean;
  onClose: () => void;
  pets: Array<{ id: number; nome: string }>;
  initialPetId?: number;
  onSubmit: (data: InviteCaregiverData) => Promise<void> | void;
  isLoading?: boolean;
}

const InviteCaregiverBody = memo(function InviteCaregiverBody({
  onClose,
  pets,
  initialPetId,
  onSubmit,
  isLoading = false,
}: Omit<InviteCaregiverModalProps, 'visible'>) {
  const [form, setForm] = useState(() => ({
    email: '',
    petId: initialPetId ?? (pets.length > 0 ? pets[0].id : 0),
  }));

  const handleEmailChange = useCallback((email: string) => {
    setForm((prev) => ({ ...prev, email }));
  }, []);

  const handlePetSelect = useCallback((petId: number) => {
    setForm((prev) => ({ ...prev, petId }));
  }, []);

  const handleSubmit = () => {
    const validacao = InviteCaregiverSchema.safeParse(form);

    if (!validacao.success) {
      Alert.alert('Atenção', formatZodError(validacao.error));
      return;
    }

    onSubmit(validacao.data);
  };

  return (
    <>
      <CustomInput
        label="E-mail do Familiar"
        placeholder="familiar@email.com"
        keyboardType="email-address"
        autoCapitalize="none"
        maxLength={80}
        value={form.email}
        onChangeText={handleEmailChange}
      />

      <PetSelector
        label="Selecione o Pet"
        pets={pets}
        selectedPetId={form.petId}
        onSelectPet={handlePetSelect}
      />

      <View style={styles.modalButtonsRow}>
        <CustomButton
          title="Cancelar"
          variant="outline"
          onPress={onClose}
          style={{ flex: 1 }}
        />
        <CustomButton
          title="Enviar Convite"
          variant="primary"
          isLoading={isLoading}
          disabled={isLoading}
          onPress={handleSubmit}
          style={{ flex: 1 }}
        />
      </View>
    </>
  );
});

export function InviteCaregiverModal({
  visible,
  onClose,
  pets,
  initialPetId,
  onSubmit,
  isLoading = false,
}: InviteCaregiverModalProps) {
  return (
    <BaseModal
      visible={visible}
      onClose={onClose}
      title="Convidar Familiar"
      subtitle="Vincule um membro da família para compartilhar a rotina do animal."
      size="sm"
    >
      {visible ? (
        <InviteCaregiverBody
          key={initialPetId || 'default'}
          onClose={onClose}
          pets={pets}
          initialPetId={initialPetId}
          onSubmit={onSubmit}
          isLoading={isLoading}
        />
      ) : null}
    </BaseModal>
  );
}

const styles = StyleSheet.create({
  modalButtonsRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 10,
    marginBottom: 6,
  },
});
