import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { BaseModal } from '../BaseModal';
import { CustomInput } from '../CustomInput';
import { CustomButton } from '../CustomButton';
import { PetPorte } from '../../types/pet';

export interface PetFormData {
  nome: string;
  raca: string;
  dataNasc: string;
  porte: PetPorte;
  sexo: string;
  castrado: boolean;
  avatarId?: string;
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

const DEFAULT_FORM: PetFormData = {
  nome: '',
  raca: '',
  dataNasc: '',
  porte: 'MEDIO',
  sexo: 'M',
  castrado: false,
  avatarId: '1',
};

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
  const [form, setForm] = useState<PetFormData>(DEFAULT_FORM);

  useEffect(() => {
    if (visible) {
      if (initialData) {
        setForm({
          nome: initialData.nome || '',
          raca: initialData.raca || '',
          dataNasc: initialData.dataNasc || '',
          porte: initialData.porte || 'MEDIO',
          sexo: initialData.sexo || 'M',
          castrado: initialData.castrado ?? false,
          avatarId: initialData.avatarId || '1',
        });
      } else {
        setForm(DEFAULT_FORM);
      }
    }
  }, [visible, initialData]);

  const handleSubmit = () => {
    onSubmit(form);
  };

  const modalTitle = title || (mode === 'create' ? 'Cadastrar Novo Pet' : 'Editar Ficha do Pet');
  const modalSubtitle =
    subtitle ||
    (mode === 'create'
      ? 'Adicione seu animal à família PetGuardian'
      : 'Atualize os dados cadastrais do animal');
  const buttonTitle =
    submitButtonTitle || (mode === 'create' ? 'Cadastrar Pet' : 'Salvar Alterações');

  return (
    <BaseModal visible={visible} onClose={onClose} title={modalTitle} subtitle={modalSubtitle}>
      <CustomInput
        label="Nome do Pet"
        placeholder="Ex: Luna, Thor, Bob..."
        value={form.nome}
        onChangeText={(t) => setForm((p) => ({ ...p, nome: t }))}
      />

      <CustomInput
        label="Raça"
        placeholder="Ex: Golden Retriever, SRD, Poodle..."
        value={form.raca}
        onChangeText={(t) => setForm((p) => ({ ...p, raca: t }))}
      />

      <CustomInput
        label="Data de Nascimento"
        placeholder="DD/MM/AAAA (ex: 15/05/2023)"
        value={form.dataNasc}
        onChangeText={(t) => setForm((p) => ({ ...p, dataNasc: t }))}
      />

      {/* Porte */}
      <Text style={styles.fieldLabel}>Porte do Animal</Text>
      <View style={styles.porteRow}>
        {(['PEQUENO', 'MEDIO', 'GRANDE'] as PetPorte[]).map((porte) => (
          <TouchableOpacity
            key={porte}
            style={[styles.porteBtn, form.porte === porte && styles.porteBtnSelected]}
            onPress={() => setForm((p) => ({ ...p, porte }))}
          >
            <Text
              style={[
                styles.porteBtnText,
                form.porte === porte && styles.porteBtnTextSelected,
              ]}
            >
              {porte}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Sexo */}
      <Text style={styles.fieldLabel}>Sexo</Text>
      <View style={styles.porteRow}>
        <TouchableOpacity
          style={[styles.porteBtn, form.sexo === 'M' && styles.porteBtnSelected]}
          onPress={() => setForm((p) => ({ ...p, sexo: 'M' }))}
        >
          <Text
            style={[styles.porteBtnText, form.sexo === 'M' && styles.porteBtnTextSelected]}
          >
            Macho
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.porteBtn, form.sexo === 'F' && styles.porteBtnSelected]}
          onPress={() => setForm((p) => ({ ...p, sexo: 'F' }))}
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
          onPress={() => setForm((p) => ({ ...p, castrado: true }))}
        >
          <Text
            style={[styles.porteBtnText, form.castrado && styles.porteBtnTextSelected]}
          >
            Sim
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.porteBtn, !form.castrado && styles.porteBtnSelected]}
          onPress={() => setForm((p) => ({ ...p, castrado: false }))}
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
          variant={mode === 'create' ? 'success' : 'primary'}
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
