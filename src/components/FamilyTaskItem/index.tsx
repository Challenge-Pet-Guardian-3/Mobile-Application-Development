import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { TarefaResponse } from '../../types/task';

export interface FamilyTaskItemProps {
  tarefa: TarefaResponse;
  petNome: string;
  onDelete: (id: number) => void;
}

export function FamilyTaskItem({ tarefa, petNome, onDelete }: FamilyTaskItemProps) {
  const handleDeletePress = () => {
    Alert.alert('Remover Tarefa', 'Deseja realmente excluir esta tarefa?', [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Excluir', style: 'destructive', onPress: () => onDelete(tarefa.id) },
    ]);
  };

  return (
    <View style={styles.taskListItem}>
      <View style={styles.taskIconBox}>
        <Ionicons name="paw" size={14} color="#0284C7" />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={styles.taskListTitle}>{tarefa.titulo}</Text>
        <Text style={styles.taskListPet}>
          Para: {petNome} • +{tarefa.pontosTarefa} XP
        </Text>
      </View>
      <TouchableOpacity
        onPress={handleDeletePress}
        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
      >
        <Ionicons name="trash-outline" size={16} color="#94A3B8" />
      </TouchableOpacity>
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
  taskIconBox: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#EFF6FF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  taskListTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1E293B',
  },
  taskListPet: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 2,
  },
});
