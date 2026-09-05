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
  onSubmit: (data: TaskFormData) => Promise<void> | void;
  isLoading?: boolean;
}

export function TaskFormModal({
  visible,
  onClose,
  pets,
  initialPetId,
  onSubmit,
  isLoading = false,
}: TaskFormModalProps) {
  const [selectedPetId, setSelectedPetId] = useState<number | null>(null);
  const [titulo, setTitulo] = useState('');
  const [descricao, setDescricao] = useState('');
  const [pontos, setPontos] = useState('');

  useEffect(() => {
    if (visible) {
      setSelectedPetId(initialPetId || (pets.length > 0 ? pets[0].id : null));
      setTitulo('');
      setDescricao('');
      setPontos('');
    }
  }, [visible, initialPetId, pets]);

  const pontosNum = Number(pontos);
  const isInvalido =
    !selectedPetId ||
    !titulo.trim() ||
    !descricao.trim() ||
    !pontos.trim() ||
    isNaN(pontosNum) ||
    pontosNum <= 0;

  const handleSubmit = () => {
    const validacao = TaskSchema.safeParse({
      petId: selectedPetId,
      titulo,
      descricao,
      pontos,
    });

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
      title="Criar Tarefa para o Pet"
      subtitle="Defina rotinas de alimentação, passeios ou medicação"
    >
      <Text style={styles.fieldLabel}>Para qual Pet?</Text>
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

      <CustomInput
        label="Título da Tarefa"
        placeholder="Ex: Passeio de 30min, Ração da tarde..."
        value={titulo}
        onChangeText={setTitulo}
      />

      <CustomInput
        label="Descrição detalhada"
        placeholder="Instruções ou remédios a dar..."
        value={descricao}
        onChangeText={setDescricao}
      />

      <CustomInput
        label="Pontos XP de Recompensa"
        placeholder="Ex: 15"
        keyboardType="numeric"
        value={pontos}
        onChangeText={setPontos}
      />

      <View style={styles.modalButtonsRow}>
        <CustomButton
          title="Cancelar"
          variant="outline"
          onPress={onClose}
          style={{ flex: 1 }}
        />
        <CustomButton
          title="Criar Tarefa"
          variant="success"
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
