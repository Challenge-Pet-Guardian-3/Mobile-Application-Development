import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { BaseModal } from '../BaseModal';
import { CustomInput } from '../CustomInput';
import { CustomButton } from '../CustomButton';
import { InviteCaregiverSchema, formatZodError } from '../../utils/schemas';

export interface InviteCaregiverData {
  email: string;
  petId: number;
}

interface InviteCaregiverModalProps {
  visible: boolean;
  onClose: () => void;
  pets: Array<{ id: number; nome: string }>;
  initialPetId?: number | null;
  onSubmit: (data: InviteCaregiverData) => Promise<void> | void;
  isLoading?: boolean;
}

const INITIAL_INVITE_FORM = {
  email: '',
  petId: null as number | null,
};

export function InviteCaregiverModal({
  visible,
  onClose,
  pets,
  initialPetId,
  onSubmit,
  isLoading = false,
}: InviteCaregiverModalProps) {
  const [form, setForm] = useState(INITIAL_INVITE_FORM);

  useEffect(() => {
    if (visible) {
      setForm({
        ...INITIAL_INVITE_FORM,
        petId: initialPetId || (pets.length > 0 ? pets[0].id : null),
      });
    }
  }, [visible, initialPetId, pets]);

  const updateField = <K extends keyof typeof INITIAL_INVITE_FORM>(
    key: K,
    value: (typeof INITIAL_INVITE_FORM)[K]
  ) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = () => {
    const validacao = InviteCaregiverSchema.safeParse(form);

    if (!validacao.success) {
      Alert.alert('Atenção', formatZodError(validacao.error));
      return;
    }

    onSubmit(validacao.data);
  };

  return (
    <BaseModal
      visible={visible}
      onClose={onClose}
      title="Convidar Familiar"
      subtitle="Vincule um membro da família para compartilhar a rotina do animal."
    >
      <CustomInput
        label="E-mail do Familiar"
        placeholder="familiar@email.com"
        keyboardType="email-address"
        autoCapitalize="none"
        maxLength={80}
        value={form.email}
        onChangeText={(t) => updateField('email', t)}
      />

      <Text style={styles.fieldLabel}>Selecione o Pet</Text>
      <View style={styles.porteRow}>
        {pets.map((p) => (
          <TouchableOpacity
            key={p.id}
            style={[styles.porteBtn, form.petId === p.id && styles.porteBtnSelected]}
            onPress={() => updateField('petId', p.id)}
          >
            <Text
              style={[
                styles.porteBtnText,
                form.petId === p.id && styles.porteBtnTextSelected,
              ]}
            >
              {p.nome}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

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
    </BaseModal>
  );
}

const styles = StyleSheet.create({
  fieldLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: '#334155',
    marginBottom: 8,
    marginTop: 4,
  },
  porteRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
  },
  porteBtn: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: '#F1F5F9',
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  porteBtnSelected: {
    backgroundColor: '#0284C7',
    borderColor: '#0284C7',
  },
  porteBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#64748B',
  },
  porteBtnTextSelected: {
    color: '#FFFFFF',
  },
  modalButtonsRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 10,
    marginBottom: 6,
  },
});
