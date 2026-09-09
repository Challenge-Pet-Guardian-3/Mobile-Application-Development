import React, { useState, useCallback, memo } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { BaseModal } from '../BaseModal';
import { CustomInput } from '../CustomInput';
import { CustomButton } from '../CustomButton';
import { CustomDateInput } from '../CustomDateInput';
import { PetSelector } from '../PetSelector';
import { TaskSchema, formatZodError } from '../../utils/schemas';
import { formatarIsoParaBr, obterPrazoFuturoPadraoBr, normalizarPrazoParaIso } from '../../utils/petUtils';
import { TaskFormData } from '../../types/task';
export type { TaskFormData };

interface TaskFormModalProps {
  visible: boolean;
  onClose: () => void;
  pets: Array<{ id: number; nome: string }>;
  initialPetId?: number;
  mode?: 'create' | 'edit';
  initialData?: TaskFormData;
  onSubmit: (data: TaskFormData) => Promise<void> | void;
  isLoading?: boolean;
}

interface TaskFormState {
  petId?: number;
  titulo: string;
  descricao: string;
  pontos: string;
  prazo: string;
  status: 'PENDENTE' | 'CONCLUIDO';
}

const INITIAL_TASK_FORM: TaskFormState = {
  petId: undefined,
  titulo: '',
  descricao: '',
  pontos: '',
  prazo: '',
  status: 'PENDENTE',
};

function getInitialForm(
  mode: 'create' | 'edit',
  initialData?: TaskFormData,
  initialPetId?: number,
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
    petId: initialPetId ?? (pets && pets.length > 0 ? pets[0].id : undefined),
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

  const updateField = useCallback(
    <K extends keyof TaskFormState>(field: K, value: TaskFormState[K]) => {
      setForm((prev) => ({ ...prev, [field]: value }));
    },
    []
  );

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
        onSelectPet={(petId) => updateField('petId', petId)}
      />

      <CustomInput
        label="Título da Tarefa"
        placeholder="Ex: Passeio de 30min, Ração da tarde..."
        maxLength={60}
        value={form.titulo}
        onChangeText={(titulo) => updateField('titulo', titulo)}
      />

      <CustomInput
        label="Descrição detalhada"
        placeholder="Instruções ou remédios a dar..."
        maxLength={200}
        value={form.descricao}
        onChangeText={(descricao) => updateField('descricao', descricao)}
      />

      <CustomInput
        label="Pontos XP de Recompensa"
        placeholder="Ex: 15"
        keyboardType="numeric"
        maxLength={4}
        value={form.pontos}
        onChangeText={(p) => updateField('pontos', p.replace(/\D/g, ''))}
      />

      {/* Data e Horário de Conclusão / Prazo */}
      <CustomDateInput
        label="Data e Horário de Conclusão Prevista (Prazo)"
        placeholder="DD/MM/AAAA HH:mm"
        showTime
        quickTimePresets
        value={form.prazo}
        onChangeDate={(prazo) => updateField('prazo', prazo)}
      />

      {/* Controle de Status no modo Edição */}
      {mode === 'edit' && (
        <TaskStatusSelector
          status={form.status}
          onStatusChange={(status) => updateField('status', status)}
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

function ExpiredTaskBanner() {
  return (
    <View style={styles.expiredBanner}>
      <View style={styles.expiredIconBox}>
        <Ionicons name="time-outline" size={20} color="#D97706" />
      </View>
      <View style={styles.expiredContent}>
        <Text style={styles.expiredTitle}>Tarefa Expirada</Text>
        <Text style={styles.expiredDescription}>
          Defina um novo horário futuro no campo de prazo abaixo para reativá-la como pendente na rotina do pet.
        </Text>
      </View>
    </View>
  );
}

interface TaskStatusSelectorProps {
  status: 'PENDENTE' | 'CONCLUIDO';
  onStatusChange: (status: 'PENDENTE' | 'CONCLUIDO') => void;
}

const TaskStatusSelector = memo(function TaskStatusSelector({
  status,
  onStatusChange,
}: TaskStatusSelectorProps) {
  const isConcluido = status === 'CONCLUIDO';

  return (
    <View style={styles.statusContainer}>
      <Text style={styles.fieldLabel}>Status da Tarefa</Text>
      <View style={styles.statusRow}>
        <TouchableOpacity
          style={[styles.statusBtn, !isConcluido && styles.statusBtnPendenteActive]}
          onPress={() => onStatusChange('PENDENTE')}
          activeOpacity={0.8}
        >
          <Ionicons
            name={!isConcluido ? 'time' : 'time-outline'}
            size={18}
            color={!isConcluido ? '#D97706' : '#64748B'}
          />
          <Text style={[styles.statusBtnText, !isConcluido && styles.statusBtnTextPendenteActive]}>
            Pendente
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.statusBtn, isConcluido && styles.statusBtnConcluidoActive]}
          onPress={() => onStatusChange('CONCLUIDO')}
          activeOpacity={0.8}
        >
          <Ionicons
            name={isConcluido ? 'checkmark-circle' : 'checkmark-circle-outline'}
            size={18}
            color={isConcluido ? '#16A34A' : '#64748B'}
          />
          <Text style={[styles.statusBtnText, isConcluido && styles.statusBtnTextConcluidoActive]}>
            Concluída
          </Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.statusHelpText}>
        {isConcluido
          ? 'Tarefa marcada como Concluída (data e horário de realização são registrados automaticamente pelo sistema).'
          : 'Tarefa em aberto. Toque em "Concluída" para marcar sua realização imediata.'}
      </Text>
    </View>
  );
});

const styles = StyleSheet.create({
  modalButtonsRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 10,
    marginBottom: 6,
  },
  expiredBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF3C7',
    borderWidth: 1,
    borderColor: '#FDE68A',
    borderRadius: 14,
    padding: 12,
    gap: 10,
    marginBottom: 16,
  },
  expiredIconBox: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#FDE68A',
    justifyContent: 'center',
    alignItems: 'center',
  },
  expiredContent: {
    flex: 1,
  },
  expiredTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#92400E',
    marginBottom: 2,
  },
  expiredDescription: {
    fontSize: 12,
    color: '#B45309',
    lineHeight: 16,
  },
  statusContainer: {
    marginTop: 6,
    marginBottom: 12,
  },
  fieldLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: '#334155',
    marginBottom: 8,
    marginTop: 4,
  },
  statusRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 8,
  },
  statusBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    paddingHorizontal: 8,
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
  },
  statusBtnPendenteActive: {
    backgroundColor: '#FEF3C7',
    borderColor: '#F59E0B',
  },
  statusBtnConcluidoActive: {
    backgroundColor: '#DCFCE7',
    borderColor: '#22C55E',
  },
  statusBtnText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#64748B',
  },
  statusBtnTextPendenteActive: {
    color: '#B45309',
    fontWeight: '700',
  },
  statusBtnTextConcluidoActive: {
    color: '#15803D',
    fontWeight: '700',
  },
  statusHelpText: {
    fontSize: 12,
    color: '#64748B',
    lineHeight: 16,
    marginTop: 2,
    marginBottom: 4,
  },
});
