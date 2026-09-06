import React, { memo } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface TaskStatusSelectorProps {
  status: 'PENDENTE' | 'CONCLUIDO';
  onStatusChange: (status: 'PENDENTE' | 'CONCLUIDO') => void;
  containerStyle?: ViewStyle;
}

export const TaskStatusSelector = memo(function TaskStatusSelector({
  status,
  onStatusChange,
  containerStyle,
}: TaskStatusSelectorProps) {
  const isConcluido = status === 'CONCLUIDO';

  return (
    <View style={[styles.container, containerStyle]}>
      <Text style={styles.fieldLabel}>Status da Tarefa</Text>
      <View style={styles.statusRow}>
        <TouchableOpacity
          style={[
            styles.statusBtn,
            !isConcluido && styles.statusBtnPendenteActive,
          ]}
          onPress={() => onStatusChange('PENDENTE')}
          activeOpacity={0.8}
        >
          <Ionicons
            name={!isConcluido ? 'time' : 'time-outline'}
            size={18}
            color={!isConcluido ? '#D97706' : '#64748B'}
          />
          <Text
            style={[
              styles.statusBtnText,
              !isConcluido && styles.statusBtnTextPendenteActive,
            ]}
            numberOfLines={1}
          >
            Pendente
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.statusBtn,
            isConcluido && styles.statusBtnConcluidoActive,
          ]}
          onPress={() => onStatusChange('CONCLUIDO')}
          activeOpacity={0.8}
        >
          <Ionicons
            name={isConcluido ? 'checkmark-circle' : 'checkmark-circle-outline'}
            size={18}
            color={isConcluido ? '#16A34A' : '#64748B'}
          />
          <Text
            style={[
              styles.statusBtnText,
              isConcluido && styles.statusBtnTextConcluidoActive,
            ]}
            numberOfLines={1}
          >
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
  container: {
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
