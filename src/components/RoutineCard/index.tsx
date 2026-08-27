import React, { memo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
import { TarefaResponse } from '../../types/task';

interface RoutineCardProps {
  tarefa: TarefaResponse;
  onToggle: (id: number) => void;
  onDelete?: (id: number) => void;
}

export const RoutineCard = memo(function RoutineCard({
  tarefa,
  onToggle,
  onDelete,
}: RoutineCardProps) {
  const isDone = tarefa.status === 'CONCLUIDO';

  return (
    <View style={[styles.card, isDone && styles.cardDone]}>
      <TouchableOpacity
        style={styles.contentLeft}
        onPress={() => onToggle(tarefa.id)}
        activeOpacity={0.7}
      >
        <View style={[styles.checkbox, isDone && styles.checkboxDone]}>
          {isDone ? (
            <Ionicons name="checkmark" size={16} color="#FFFFFF" />
          ) : (
            <View style={styles.checkboxInner} />
          )}
        </View>

        <View style={styles.textContainer}>
          <Text style={[styles.title, isDone && styles.titleDone]} numberOfLines={1}>
            {tarefa.titulo}
          </Text>
          {tarefa.descricao ? (
            <Text style={[styles.description, isDone && styles.descriptionDone]} numberOfLines={1}>
              {tarefa.descricao}
            </Text>
          ) : null}
        </View>
      </TouchableOpacity>

      <View style={styles.rightContainer}>
        <View style={[styles.xpBadge, isDone && styles.xpBadgeDone]}>
          <Text style={[styles.xpText, isDone && styles.xpTextDone]}>+{tarefa.pontosTarefa || 15} XP</Text>
        </View>

        {onDelete && (
          <TouchableOpacity
            style={styles.deleteButton}
            onPress={() => onDelete(tarefa.id)}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Ionicons name="close-circle" size={18} color="#CBD5E1" />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
});

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: 'rgba(226, 232, 240, 0.8)',
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.02,
    shadowRadius: 6,
    elevation: 1,
  },
  cardDone: {
    backgroundColor: '#F8FAFC',
    borderColor: '#E2E8F0',
    opacity: 0.85,
  },
  contentLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 12,
  },
  checkbox: {
    width: 26,
    height: 26,
    borderRadius: 13,
    borderWidth: 2,
    borderColor: '#CBD5E1',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  checkboxInner: {
    width: 0,
    height: 0,
  },
  checkboxDone: {
    backgroundColor: '#10B981',
    borderColor: '#10B981',
  },
  textContainer: {
    flex: 1,
  },
  title: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1E293B',
  },
  titleDone: {
    textDecorationLine: 'line-through',
    color: '#94A3B8',
  },
  description: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
  },
  descriptionDone: {
    color: '#CBD5E1',
  },
  rightContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  xpBadge: {
    backgroundColor: '#EFF6FF',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 10,
  },
  xpBadgeDone: {
    backgroundColor: '#ECFDF5',
  },
  xpText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#2563EB',
  },
  xpTextDone: {
    color: '#059669',
  },
  deleteButton: {
    padding: 2,
  },
});
