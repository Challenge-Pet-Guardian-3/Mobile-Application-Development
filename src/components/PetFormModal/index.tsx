import React, { useState, useCallback, memo } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { BaseModal } from '../BaseModal';
import { CustomInput } from '../CustomInput';
import { CustomDateInput } from '../CustomDateInput';
import { CustomButton } from '../CustomButton';
import { PetPorte } from '../../types/pet';
import { PetSchema, formatZodError } from '../../utils/schemas';

export interface PetFormData {
  nome: string;
  raca: string;
  dataNasc: string;
  porte: PetPorte;
  sexo: string;
  castrado: boolean;
}

interface PetFormModalProps {
  visible: boolean;
  onClose: () => void;
  title?: string;
  subtitle?: string;
  mode?: 'create' | 'edit';
  initialData?: Partial<PetFormData> | null;
  onSubmit: (data: PetFormData) => Promise<void> | void;
  isLoading?: boolean;
  submitButtonTitle?: string;
}

const INITIAL_PET_FORM: PetFormData = {
  nome: '',
  raca: '',
  dataNasc: '',
  porte: 'MEDIO',
  sexo: 'M',
  castrado: false,
};

const PetFormBody = memo(function PetFormBody({
  onClose,
  initialData,
  onSubmit,
  isLoading = false,
  buttonTitle,
}: {
  onClose: () => void;
  initialData?: Partial<PetFormData> | null;
  onSubmit: (data: PetFormData) => Promise<void> | void;
  isLoading?: boolean;
  buttonTitle: string;
}) {
  const [form, setForm] = useState<PetFormData>(() => ({
    ...INITIAL_PET_FORM,
    ...initialData,
  }));

  const updateField = useCallback(
    <K extends keyof PetFormData>(key: K, value: PetFormData[K]) => {
      setForm((prev) => ({ ...prev, [key]: value }));
    },
    []
  );

  const handleSubmit = () => {
    const validacao = PetSchema.safeParse(form);

    if (!validacao.success) {
      Alert.alert('Atenção', formatZodError(validacao.error));
      return;
    }

    onSubmit(validacao.data);
  };

  return (
    <>
      <CustomInput
        label="Nome do Pet"
        placeholder="Ex: Luna, Thor, Bob..."
        maxLength={50}
        value={form.nome}
        onChangeText={(t) => updateField('nome', t)}
      />

      <CustomInput
        label="Raça"
        placeholder="Ex: Golden Retriever, SRD, Poodle..."
        maxLength={50}
        value={form.raca}
        onChangeText={(t) => updateField('raca', t)}
      />

      <CustomDateInput
        label="Data de Nascimento"
        placeholder="DD/MM/AAAA (ex: 15/05/2023)"
        value={form.dataNasc}
        onChangeDate={(d) => updateField('dataNasc', d)}
      />

      {/* Porte */}
      <Text style={styles.fieldLabel}>Porte do Animal</Text>
      <View style={styles.porteRow}>
        {(['PEQUENO', 'MEDIO', 'GRANDE'] as PetPorte[]).map((p) => (
          <TouchableOpacity
            key={p}
            style={[styles.porteBtn, form.porte === p && styles.porteBtnSelected]}
            onPress={() => updateField('porte', p)}
          >
            <Text
              style={[
                styles.porteBtnText,
                form.porte === p && styles.porteBtnTextSelected,
              ]}
            >
              {p}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Sexo */}
      <Text style={styles.fieldLabel}>Sexo</Text>
      <View style={styles.porteRow}>
        <TouchableOpacity
          style={[styles.porteBtn, form.sexo === 'M' && styles.porteBtnSelected]}
          onPress={() => updateField('sexo', 'M')}
        >
          <Text
            style={[styles.porteBtnText, form.sexo === 'M' && styles.porteBtnTextSelected]}
          >
            Macho
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.porteBtn, form.sexo === 'F' && styles.porteBtnSelected]}
          onPress={() => updateField('sexo', 'F')}
        >
          <Text
            style={[styles.porteBtnText, form.sexo === 'F' && styles.porteBtnTextSelected]}
          >
            Fêmea
          </Text>
        </TouchableOpacity>
      </View>

      {/* Castrado */}
      <Text style={styles.fieldLabel}>Castrado?</Text>
      <View style={styles.porteRow}>
        <TouchableOpacity
          style={[styles.porteBtn, form.castrado && styles.porteBtnSelected]}
          onPress={() => updateField('castrado', true)}
        >
          <Text
            style={[styles.porteBtnText, form.castrado && styles.porteBtnTextSelected]}
          >
            Sim
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.porteBtn, !form.castrado && styles.porteBtnSelected]}
          onPress={() => updateField('castrado', false)}
        >
          <Text
            style={[styles.porteBtnText, !form.castrado && styles.porteBtnTextSelected]}
          >
            Não
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.modalButtonsRow}>
        <CustomButton
          title="Cancelar"
          variant="outline"
          onPress={onClose}
          style={{ flex: 1 }}
        />
        <CustomButton
          title={buttonTitle}
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

export function PetFormModal({
  visible,
  onClose,
  title,
  subtitle,
  mode = 'create',
  initialData,
  onSubmit,
  isLoading = false,
  submitButtonTitle,
}: PetFormModalProps) {
  const modalTitle = title || (mode === 'create' ? 'Cadastrar Novo Pet' : 'Editar Ficha do Pet');
  const modalSubtitle =
    subtitle ||
    (mode === 'create'
      ? 'Adicione seu animal à família PetGuardian'
      : 'Atualize os dados cadastrais do animal');
  const buttonTitle =
    submitButtonTitle || (mode === 'create' ? 'Cadastrar Pet' : 'Salvar Alterações');

  const formKey = visible
    ? (mode === 'edit' && initialData?.nome ? `edit_${initialData.nome}` : 'create')
    : 'closed';

  return (
    <BaseModal
      visible={visible}
      onClose={onClose}
      title={modalTitle}
      subtitle={modalSubtitle}
      size="md"
    >
      {visible ? (
        <PetFormBody
          key={formKey}
          onClose={onClose}
          initialData={initialData}
          onSubmit={onSubmit}
          isLoading={isLoading}
          buttonTitle={buttonTitle}
        />
      ) : null}
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
    gap: 8,
    marginBottom: 16,
  },
  porteBtn: {
    flex: 1,
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
