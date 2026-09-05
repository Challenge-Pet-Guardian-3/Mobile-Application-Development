import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { BaseModal } from '../BaseModal';
import { CustomInput } from '../CustomInput';
import { CustomButton } from '../CustomButton';
import { TaskSchema, formatZodError } from '../../utils/schemas';

export interface TaskFormData {
  petId: number;
  titulo: string;
  descricao: string;
  pontos: string;
}

interface TaskFormModalProps {
  visible: boolean;
  onClose: () => void;
  pets: Array<{ id: number; nome: string }>;
  initialPetId?: number | null;
  mode?: 'create' | 'edit';
  initialData?: TaskFormData | null;
  onSubmit: (data: TaskFormData) => Promise<void> | void;
  isLoading?: boolean;
}

const INITIAL_TASK_FORM = {
  petId: null as number | null,
  titulo: '',
  descricao: '',
  pontos: '',
};

export function TaskFormModal({
  visible,
  onClose,
  pets,
  initialPetId,
  mode = 'create',
  initialData,
  onSubmit,
  isLoading = false,
}: TaskFormModalProps) {
  const [form, setForm] = useState(INITIAL_TASK_FORM);

  useEffect(() => {
    if (visible) {
      if (mode === 'edit' && initialData) {
        setForm({
          petId: initialData.petId,
          titulo: initialData.titulo,
          descricao: initialData.descricao,
          pontos: String(initialData.pontos),
        });
      } else {
        setForm({
          ...INITIAL_TASK_FORM,
          petId: initialPetId || (pets.length > 0 ? pets[0].id : null),
        });
      }
    }
  }, [visible, initialPetId, pets, mode, initialData]);

  const updateField = <K extends keyof typeof INITIAL_TASK_FORM>(
    key: K,
    value: (typeof INITIAL_TASK_FORM)[K]
  ) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = () => {
    const validacao = TaskSchema.safeParse(form);

    if (!validacao.success) {
      Alert.alert('Dados Incompletos', formatZodError(validacao.error));
      return;
    }

    onSubmit({
      petId: validacao.data.petId,
      titulo: validacao.data.titulo,
      descricao: validacao.data.descricao,
      pontos: String(validacao.data.pontos),
    });
  };

  return (
    <BaseModal
      visible={visible}
      onClose={onClose}
      title={mode === 'edit' ? 'Editar Tarefa' : 'Criar Tarefa para o Pet'}
      subtitle={
        mode === 'edit'
          ? 'Atualize as instruções ou pontuação desta rotina'
          : 'Defina rotinas de alimentação, passeios ou medicação'
      }
    >
      <Text style={styles.fieldLabel}>Para qual Pet?</Text>
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

      <CustomInput
        label="Título da Tarefa"
        placeholder="Ex: Passeio de 30min, Ração da tarde..."
        maxLength={60}
        value={form.titulo}
        onChangeText={(t) => updateField('titulo', t)}
      />

      <CustomInput
        label="Descrição detalhada"
        placeholder="Instruções ou remédios a dar..."
        maxLength={200}
        value={form.descricao}
        onChangeText={(t) => updateField('descricao', t)}
      />

      <CustomInput
        label="Pontos XP de Recompensa"
        placeholder="Ex: 15"
        keyboardType="numeric"
        maxLength={4}
        value={form.pontos}
        onChangeText={(t) => updateField('pontos', t.replace(/\D/g, ''))}
      />

      <View style={styles.modalButtonsRow}>
        <CustomButton
          title="Cancelar"
          variant="outline"
          onPress={onClose}
          style={{ flex: 1 }}
        />
        <CustomButton
          title={mode === 'edit' ? 'Salvar Alterações' : 'Criar Tarefa'}
          variant="success"
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
