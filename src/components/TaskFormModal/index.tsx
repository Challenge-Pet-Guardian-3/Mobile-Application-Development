import React, { useState, useCallback, memo } from 'react';
import { View, StyleSheet, Alert } from 'react-native';
import { BaseModal } from '../BaseModal';
import { CustomInput } from '../CustomInput';
import { CustomButton } from '../CustomButton';
import { CustomDateInput } from '../CustomDateInput';
import { TaskStatusSelector } from '../TaskStatusSelector';
import { PetSelector } from '../PetSelector';
import { ExpiredTaskBanner } from '../ExpiredTaskBanner';
import { TaskSchema, formatZodError } from '../../utils/schemas';
import {
  formatarIsoParaBr,
  obterPrazoFuturoPadraoBr,
  normalizarPrazoParaIso,
} from '../../utils/petUtils';

export interface TaskFormData {
  petId: number;
  titulo: string;
  descricao: string;
  pontos: string;
  prazo?: string;
  status?: 'PENDENTE' | 'CONCLUIDO' | 'EXPIRADO';
  conclusao?: string | null;
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

interface TaskFormState {
  petId: number | null;
  titulo: string;
  descricao: string;
  pontos: string;
  prazo: string;
  status: 'PENDENTE' | 'CONCLUIDO';
}

const INITIAL_TASK_FORM: TaskFormState = {
  petId: null,
  titulo: '',
  descricao: '',
  pontos: '',
  prazo: '',
  status: 'PENDENTE',
};

function getInitialForm(
  mode: 'create' | 'edit',
  initialData?: TaskFormData | null,
  initialPetId?: number | null,
  pets?: Array<{ id: number; nome: string }>
): TaskFormState {
  if (mode === 'edit' && initialData) {
    const isExpirada = initialData.status === 'EXPIRADO';
    const prazoBr = formatarIsoParaBr(initialData.prazo, true);
    const prazoValido = isExpirada
      ? obterPrazoFuturoPadraoBr()
      : (prazoBr || obterPrazoFuturoPadraoBr());

    return {
      petId: initialData.petId,
      titulo: initialData.titulo,
      descricao: initialData.descricao,
      pontos: String(initialData.pontos),
      prazo: prazoValido,
      status: initialData.status === 'CONCLUIDO' ? 'CONCLUIDO' : 'PENDENTE',
    };
  }

  return {
    ...INITIAL_TASK_FORM,
    petId: initialPetId || (pets && pets.length > 0 ? pets[0].id : null),
    prazo: obterPrazoFuturoPadraoBr(),
    status: 'PENDENTE',
  };
}

const TaskFormBody = memo(function TaskFormBody({
  onClose,
  pets,
  initialPetId,
  mode = 'create',
  initialData,
  onSubmit,
  isLoading = false,
}: Omit<TaskFormModalProps, 'visible'>) {
  const [form, setForm] = useState<TaskFormState>(() =>
    getInitialForm(mode, initialData, initialPetId, pets)
  );

  const handlePetSelect = useCallback((petId: number) => {
    setForm((prev) => ({ ...prev, petId }));
  }, []);

  const handleTituloChange = useCallback((titulo: string) => {
    setForm((prev) => ({ ...prev, titulo }));
  }, []);

  const handleDescricaoChange = useCallback((descricao: string) => {
    setForm((prev) => ({ ...prev, descricao }));
  }, []);

  const handlePontosChange = useCallback((p: string) => {
    setForm((prev) => ({ ...prev, pontos: p.replace(/\D/g, '') }));
  }, []);

  const handlePrazoChange = useCallback((prazo: string) => {
    setForm((prev) => ({ ...prev, prazo }));
  }, []);

  const handleStatusChange = useCallback((newStatus: 'PENDENTE' | 'CONCLUIDO') => {
    setForm((prev) => ({ ...prev, status: newStatus }));
  }, []);

  const handleSubmit = () => {
    const validacao = TaskSchema.safeParse(form);

    if (!validacao.success) {
      Alert.alert('Dados Incompletos', formatZodError(validacao.error));
      return;
    }

    const prazoIso = normalizarPrazoParaIso(form.prazo);
    const dataPrazo = new Date(prazoIso);
    if (isNaN(dataPrazo.getTime()) || dataPrazo.getTime() <= Date.now()) {
      Alert.alert(
        'Prazo Inválido',
        'O prazo da tarefa deve ser uma data e horário futuro.'
      );
      return;
    }

    onSubmit({
      petId: validacao.data.petId,
      titulo: validacao.data.titulo,
      descricao: validacao.data.descricao,
      pontos: String(validacao.data.pontos),
      prazo: form.prazo,
      status: form.status,
      conclusao: form.status === 'CONCLUIDO' ? (initialData?.conclusao || null) : null,
    });
  };

  const isExpiredEdit = mode === 'edit' && initialData?.status === 'EXPIRADO';

  return (
    <>
      {/* Banner de Tarefa Expirada Modularizado */}
      {isExpiredEdit && <ExpiredTaskBanner />}

      {/* Seletor Reutilizável de Pet */}
      <PetSelector
        label="Para qual Pet?"
        pets={pets}
        selectedPetId={form.petId}
        onSelectPet={handlePetSelect}
      />

      <CustomInput
        label="Título da Tarefa"
        placeholder="Ex: Passeio de 30min, Ração da tarde..."
        maxLength={60}
        value={form.titulo}
        onChangeText={handleTituloChange}
      />

      <CustomInput
        label="Descrição detalhada"
        placeholder="Instruções ou remédios a dar..."
        maxLength={200}
        value={form.descricao}
        onChangeText={handleDescricaoChange}
      />

      <CustomInput
        label="Pontos XP de Recompensa"
        placeholder="Ex: 15"
        keyboardType="numeric"
        maxLength={4}
        value={form.pontos}
        onChangeText={handlePontosChange}
      />

      {/* Data e Horário de Conclusão / Prazo */}
      <CustomDateInput
        label="Data e Horário de Conclusão Prevista (Prazo)"
        placeholder="DD/MM/AAAA HH:mm"
        showTime
        quickTimePresets
        value={form.prazo}
        onChangeDate={handlePrazoChange}
      />

      {/* Controle de Status no modo Edição */}
      {mode === 'edit' && (
        <TaskStatusSelector
          status={form.status}
          onStatusChange={handleStatusChange}
        />
      )}

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
    </>
  );
});

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
  // Chave estável baseada em id/identidade que reinicializa o formulário de forma pura (sem useEffect + setState)
  const formKey = visible
    ? (mode === 'edit' && initialData
        ? `edit_${initialData.petId}_${initialData.titulo}`
        : `create_${initialPetId || 'default'}`)
    : 'closed';

  return (
    <BaseModal
      visible={visible}
      onClose={onClose}
      title={mode === 'edit' ? 'Editar Tarefa' : 'Criar Tarefa para o Pet'}
      subtitle={
        mode === 'edit'
          ? 'Atualize instruções, prazo previsto ou altere o status'
          : 'Defina rotinas de alimentação, passeios ou medicação'
      }
      size="md"
    >
      {visible ? (
        <TaskFormBody
          key={formKey}
          onClose={onClose}
          pets={pets}
          initialPetId={initialPetId}
          mode={mode}
          initialData={initialData}
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
