import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { TarefaResponse } from '../../types/task';

export interface FamilyTaskItemProps {
  tarefa: TarefaResponse;
  petNome: string;
  onEdit?: (tarefa: TarefaResponse) => void;
  onDelete: (id: number) => void;
}

export function FamilyTaskItem({ tarefa, petNome, onEdit, onDelete }: FamilyTaskItemProps) {
  const isDone = tarefa.status === 'CONCLUIDO';
  const isExpired = tarefa.status === 'EXPIRADO';

  const handleDeletePress = () => {
    Alert.alert('Remover Tarefa', 'Deseja realmente excluir esta tarefa?', [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Excluir', style: 'destructive', onPress: () => onDelete(tarefa.id) },
    ]);
  };

  return (
    <View style={[styles.taskListItem, isDone && styles.taskListItemDone]}>
      <View
        style={[
          styles.taskIconBox,
          isDone && styles.taskIconBoxDone,
          isExpired && styles.taskIconBoxExpired,
        ]}
      >
        <Ionicons
          name={isDone ? 'checkmark' : isExpired ? 'alert' : 'paw'}
          size={14}
          color={isDone ? '#10B981' : isExpired ? '#EF4444' : '#0284C7'}
        />
      </View>
      <View style={{ flex: 1 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
          <Text style={[styles.taskListTitle, isDone && styles.taskListTitleDone]}>
            {tarefa.titulo}
          </Text>
          {isDone ? (
            <View style={styles.statusPillDone}>
              <Text style={styles.statusPillTextDone}>Concluída</Text>
            </View>
          ) : isExpired ? (
            <View style={styles.statusPillExpired}>
              <Text style={styles.statusPillTextExpired}>Expirada</Text>
            </View>
          ) : null}
        </View>
        <Text style={styles.taskListPet}>
          Para: {petNome} • +{tarefa.pontosTarefa} XP
        </Text>
      </View>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
        {onEdit && (
          <TouchableOpacity
            onPress={() => onEdit(tarefa)}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Ionicons name="pencil-outline" size={16} color="#64748B" />
          </TouchableOpacity>
        )}
        <TouchableOpacity
          onPress={handleDeletePress}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Ionicons name="trash-outline" size={16} color="#94A3B8" />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  taskListItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    padding: 12,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    gap: 10,
  },
  taskListItemDone: {
    backgroundColor: '#F1F5F9',
    borderColor: '#E2E8F0',
    opacity: 0.8,
  },
  taskIconBox: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#EFF6FF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  taskIconBoxDone: {
    backgroundColor: '#ECFDF5',
  },
  taskIconBoxExpired: {
    backgroundColor: '#FEF2F2',
  },
  taskListTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1E293B',
  },
  taskListTitleDone: {
    textDecorationLine: 'line-through',
    color: '#94A3B8',
  },
  statusPillDone: {
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 6,
  },
  statusPillTextDone: {
    fontSize: 10,
    fontWeight: '700',
    color: '#16A34A',
  },
  statusPillExpired: {
    backgroundColor: '#FEE2E2',
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 6,
  },
  statusPillTextExpired: {
    fontSize: 10,
    fontWeight: '700',
    color: '#DC2626',
  },
  taskListPet: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 2,
  },
});
