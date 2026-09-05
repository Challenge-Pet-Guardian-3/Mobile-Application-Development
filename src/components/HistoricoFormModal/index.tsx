import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { BaseModal } from '../BaseModal';
import { CustomInput } from '../CustomInput';
import { CustomButton } from '../CustomButton';
import { HistoricoSchema, formatZodError } from '../../utils/schemas';
import { formatarIsoParaBr, normalizarDataNascParaIso } from '../../utils/petUtils';

export interface HistoricoFormSubmitData {
  tipoHist: string;
  dataHist: string;
  petId: number;
}

interface HistoricoFormModalProps {
  visible: boolean;
  onClose: () => void;
  mode?: 'create' | 'edit';
  petId: number;
  initialData?: {
    id?: number;
    tipoHist?: string;
    dataHist?: string;
  } | null;
  onSubmit: (data: HistoricoFormSubmitData) => Promise<void> | void;
  isLoading?: boolean;
}

const SUGESTOES_EVENTOS = [
  'Vacina V10 / V8',
  'Vacina Raiva',
  'Consulta Veterinária',
  'Vermífugo',
  'Antipulgas / Carrapatos',
  'Exame Clínico',
  'Cirurgia / Castração',
];

const INITIAL_FORM = {
  tipoHist: '',
  dataHist: '',
};

export function HistoricoFormModal({
  visible,
  onClose,
  mode = 'create',
  petId,
  initialData,
  onSubmit,
  isLoading = false,
}: HistoricoFormModalProps) {
  const [form, setForm] = useState(INITIAL_FORM);

  useEffect(() => {
    if (visible) {
      if (initialData) {
        setForm({
          tipoHist: initialData.tipoHist || '',
          dataHist: initialData.dataHist ? formatarIsoParaBr(initialData.dataHist) : '',
        });
      } else {
        // Data atual por padrão no cadastro
        const hoje = new Date();
        const dia = String(hoje.getDate()).padStart(2, '0');
        const mes = String(hoje.getMonth() + 1).padStart(2, '0');
        const ano = hoje.getFullYear();
        setForm({
          tipoHist: '',
          dataHist: `${dia}/${mes}/${ano}`,
        });
      }
    }
  }, [visible, initialData]);

  const updateField = (key: keyof typeof INITIAL_FORM, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleDataChange = (text: string) => {
    const cleaned = text.replace(/\D/g, '').slice(0, 8);
    let formatted = cleaned;
    if (cleaned.length > 4) {
      formatted = `${cleaned.slice(0, 2)}/${cleaned.slice(2, 4)}/${cleaned.slice(4)}`;
    } else if (cleaned.length > 2) {
      formatted = `${cleaned.slice(0, 2)}/${cleaned.slice(2)}`;
    }
    updateField('dataHist', formatted);
  };

  const handleSubmit = () => {
    const validacao = HistoricoSchema.safeParse({
      tipoHist: form.tipoHist,
      dataHist: form.dataHist,
      petId,
    });

    if (!validacao.success) {
      Alert.alert('Atenção', formatZodError(validacao.error));
      return;
    }

    const isoDate = normalizarDataNascParaIso(form.dataHist);
    const isoDateTime = isoDate.includes('T') ? isoDate : `${isoDate}T12:00:00`;

    onSubmit({
      tipoHist: form.tipoHist.trim(),
      dataHist: isoDateTime,
      petId,
    });
  };

  return (
    <BaseModal
      visible={visible}
      onClose={onClose}
      title={mode === 'edit' ? 'Editar Registro de Saúde' : 'Novo Registro de Saúde'}
      subtitle="Cadastre vacinas, consultas médicas, exames e procedimentos veterinários."
    >
      <CustomInput
        label="Tipo de Evento / Atendimento"
        placeholder="Ex: Vacina V10, Consulta de Rotina..."
        value={form.tipoHist}
        onChangeText={(t) => updateField('tipoHist', t)}
        maxLength={100}
      />

      {/* Chips de Sugestão Rápida */}
      <Text style={styles.suggestionsLabel}>Sugestões Rápidas:</Text>
      <View style={styles.chipsRow}>
        {SUGESTOES_EVENTOS.map((sugestao) => (
          <TouchableOpacity
            key={sugestao}
            style={[
              styles.chip,
              form.tipoHist === sugestao && styles.chipSelected,
            ]}
            onPress={() => updateField('tipoHist', sugestao)}
            activeOpacity={0.7}
          >
            <Text
              style={[
                styles.chipText,
                form.tipoHist === sugestao && styles.chipTextSelected,
              ]}
            >
              {sugestao}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <CustomInput
        label="Data do Evento (DD/MM/AAAA)"
        placeholder="DD/MM/AAAA"
        keyboardType="numeric"
        maxLength={10}
        value={form.dataHist}
        onChangeText={handleDataChange}
      />

      <View style={styles.modalButtonsRow}>
        <CustomButton
          title="Cancelar"
          variant="outline"
          onPress={onClose}
          style={{ flex: 1 }}
        />
        <CustomButton
          title={mode === 'edit' ? 'Salvar Alteração' : 'Registrar'}
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
  suggestionsLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#64748B',
    marginBottom: 6,
    marginTop: -4,
  },
  chipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 14,
  },
  chip: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    backgroundColor: '#F1F5F9',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  chipSelected: {
    backgroundColor: '#EFF6FF',
    borderColor: '#2563EB',
  },
  chipText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#475569',
  },
  chipTextSelected: {
    color: '#2563EB',
    fontWeight: '700',
  },
  modalButtonsRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 10,
    marginBottom: 6,
  },
});
