import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { BaseModal } from '../BaseModal';
import { CustomInput } from '../CustomInput';
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
  const [nome, setNome] = useState('');
  const [raca, setRaca] = useState('');
  const [dataNasc, setDataNasc] = useState('');
  const [porte, setPorte] = useState<PetPorte>('MEDIO');
  const [sexo, setSexo] = useState('M');
  const [castrado, setCastrado] = useState(false);
  const [avatarId, setAvatarId] = useState('1');

  useEffect(() => {
    if (visible) {
      setNome(initialData?.nome || '');
      setRaca(initialData?.raca || '');
      setDataNasc(initialData?.dataNasc || '');
      setPorte(initialData?.porte || 'MEDIO');
      setSexo(initialData?.sexo || 'M');
      setCastrado(initialData?.castrado ?? false);
      setAvatarId(initialData?.avatarId || '1');
    }
  }, [visible, initialData]);

  const handleSubmit = () => {
    const validacao = PetSchema.safeParse({
      nome,
      raca,
      dataNasc,
      porte,
      sexo,
      castrado,
      avatarId,
    });

    if (!validacao.success) {
      Alert.alert('Atenção', formatZodError(validacao.error));
      return;
    }

    onSubmit({
      nome: validacao.data.nome,
      raca: validacao.data.raca,
      dataNasc: validacao.data.dataNasc,
      porte: validacao.data.porte,
      sexo: validacao.data.sexo,
      castrado: validacao.data.castrado,
      avatarId: validacao.data.avatarId,
    });
  };

  const modalTitle = title || (mode === 'create' ? 'Cadastrar Novo Pet' : 'Editar Ficha do Pet');
  const modalSubtitle =
    subtitle ||
    (mode === 'create'
      ? 'Adicione seu animal à família PetGuardian'
      : 'Atualize os dados cadastrais do animal');
  const buttonTitle =
    submitButtonTitle || (mode === 'create' ? 'Cadastrar Pet' : 'Salvar Alterações');

  const isInvalido = !nome.trim() || !raca.trim() || !dataNasc.trim();

  return (
    <BaseModal visible={visible} onClose={onClose} title={modalTitle} subtitle={modalSubtitle}>
      <CustomInput
        label="Nome do Pet"
        placeholder="Ex: Luna, Thor, Bob..."
        value={nome}
        onChangeText={setNome}
      />

      <CustomInput
        label="Raça"
        placeholder="Ex: Golden Retriever, SRD, Poodle..."
        value={raca}
        onChangeText={setRaca}
      />

      <CustomInput
        label="Data de Nascimento"
        placeholder="DD/MM/AAAA (ex: 15/05/2023)"
        value={dataNasc}
        onChangeText={setDataNasc}
      />

      {/* Porte */}
      <Text style={styles.fieldLabel}>Porte do Animal</Text>
      <View style={styles.porteRow}>
        {(['PEQUENO', 'MEDIO', 'GRANDE'] as PetPorte[]).map((p) => (
          <TouchableOpacity
            key={p}
            style={[styles.porteBtn, porte === p && styles.porteBtnSelected]}
            onPress={() => setPorte(p)}
          >
            <Text
              style={[
                styles.porteBtnText,
                porte === p && styles.porteBtnTextSelected,
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
          style={[styles.porteBtn, sexo === 'M' && styles.porteBtnSelected]}
          onPress={() => setSexo('M')}
        >
          <Text
            style={[styles.porteBtnText, sexo === 'M' && styles.porteBtnTextSelected]}
          >
            Macho
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.porteBtn, sexo === 'F' && styles.porteBtnSelected]}
          onPress={() => setSexo('F')}
        >
          <Text
            style={[styles.porteBtnText, sexo === 'F' && styles.porteBtnTextSelected]}
          >
            Fêmea
          </Text>
        </TouchableOpacity>
      </View>

      {/* Castrado */}
      <Text style={styles.fieldLabel}>Castrado?</Text>
      <View style={styles.porteRow}>
        <TouchableOpacity
          style={[styles.porteBtn, castrado && styles.porteBtnSelected]}
          onPress={() => setCastrado(true)}
        >
          <Text
            style={[styles.porteBtnText, castrado && styles.porteBtnTextSelected]}
          >
            Sim
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.porteBtn, !castrado && styles.porteBtnSelected]}
          onPress={() => setCastrado(false)}
        >
          <Text
            style={[styles.porteBtnText, !castrado && styles.porteBtnTextSelected]}
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
          disabled={isInvalido || isLoading}
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
