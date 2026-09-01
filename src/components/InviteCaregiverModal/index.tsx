import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { BaseModal } from '../BaseModal';
import { CustomInput } from '../CustomInput';
import { CustomButton } from '../CustomButton';

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

export function InviteCaregiverModal({
  visible,
  onClose,
  pets,
  initialPetId,
  onSubmit,
  isLoading = false,
}: InviteCaregiverModalProps) {
  const [email, setEmail] = useState('');
  const [selectedPetId, setSelectedPetId] = useState<number | null>(null);

  useEffect(() => {
    if (visible) {
      setEmail('');
      setSelectedPetId(initialPetId || (pets.length > 0 ? pets[0].id : null));
    }
  }, [visible, initialPetId, pets]);

  const handleSubmit = () => {
    if (!email.trim() || !email.includes('@')) {
      Alert.alert('E-mail inválido', 'Por favor, informe um e-mail válido do familiar.');
      return;
    }
    if (!selectedPetId) {
      Alert.alert('Selecione um Pet', 'Por favor, selecione qual pet será compartilhado.');
      return;
    }
    onSubmit({
      email: email.trim(),
      petId: selectedPetId,
    });
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
        value={email}
        onChangeText={setEmail}
      />

      <Text style={styles.fieldLabel}>Selecione o Pet</Text>
      <View style={styles.porteRow}>
        {pets.map((p) => (
          <TouchableOpacity
            key={p.id}
            style={[styles.porteBtn, selectedPetId === p.id && styles.porteBtnSelected]}
            onPress={() => setSelectedPetId(p.id)}
          >
            <Text
              style={[
                styles.porteBtnText,
                selectedPetId === p.id && styles.porteBtnTextSelected,
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
