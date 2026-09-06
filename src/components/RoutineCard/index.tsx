import React, { memo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
import { shadows } from '../../utils/shadow';
import { TarefaResponse } from '../../types/task';
import { formatarPrazoAmigavel } from '../../utils/petUtils';

export interface RoutineCardProps {
  tarefa: TarefaResponse;
  onToggle?: (id: number) => void;
  onEdit?: (tarefa: TarefaResponse) => void;
  onDelete?: (id: number) => void;
  petNome?: string;
}

export const RoutineCard = memo(function RoutineCard({
  tarefa,
  onToggle,
  onEdit,
  onDelete,
  petNome,
}: RoutineCardProps) {
  const isDone = tarefa.status === 'CONCLUIDO';
  const isExpired = tarefa.status === 'EXPIRADO';

  const handlePressCard = () => {
    if (onToggle) {
      onToggle(tarefa.id);
    }
  };

  return (
    <View style={[styles.card, isDone && styles.cardDone, isExpired && styles.cardExpired]}>
      <TouchableOpacity
        style={styles.contentLeft}
        onPress={handlePressCard}
        disabled={!onToggle}
        activeOpacity={0.7}
      >
        <View
          style={[
            styles.checkbox,
            isDone && styles.checkboxDone,
            isExpired && styles.checkboxExpired,
          ]}
        >
          {isDone ? (
            <Ionicons name="checkmark" size={16} color="#FFFFFF" />
          ) : isExpired ? (
            <Ionicons name="alert" size={14} color="#EF4444" />
          ) : (
            <View style={styles.checkboxInner} />
          )}
        </View>

        <View style={styles.textContainer}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
            <Text style={[styles.title, isDone && styles.titleDone]} numberOfLines={1}>
              {tarefa.titulo}
            </Text>
            {isExpired && (
              <View style={styles.expiredBadge}>
                <Text style={styles.expiredBadgeText}>Expirada</Text>
              </View>
            )}
          </View>
          {tarefa.descricao ? (
            <Text style={[styles.description, isDone && styles.descriptionDone]} numberOfLines={1}>
              {tarefa.descricao}
            </Text>
          ) : null}
          <View style={styles.metaRow}>
            {petNome ? (
              <View style={styles.petBadge}>
                <Ionicons name="paw" size={10} color="#2563EB" />
                <Text style={styles.petBadgeText} numberOfLines={1}>
                  {petNome}
                </Text>
              </View>
            ) : null}
            {tarefa.prazo ? (
              <View style={styles.prazoRow}>
                <Ionicons name="time-outline" size={12} color={isDone ? '#94A3B8' : '#0284C7'} />
                <Text style={[styles.prazoText, isDone && styles.prazoTextDone]}>
                  {formatarPrazoAmigavel(tarefa.prazo)}
                </Text>
              </View>
            ) : null}
          </View>
        </View>
      </TouchableOpacity>

      <View style={styles.rightContainer}>
        <View style={[styles.xpBadge, isDone && styles.xpBadgeDone]}>
          <Text style={[styles.xpText, isDone && styles.xpTextDone]}>+{tarefa.pontosTarefa || 15} XP</Text>
        </View>

        {onEdit && (
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => onEdit(tarefa)}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Ionicons name="pencil-outline" size={16} color="#94A3B8" />
          </TouchableOpacity>
        )}

        {onDelete && (
          <TouchableOpacity
            style={styles.actionButton}
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
    ...shadows.xs,
    elevation: 1,
  },
  cardDone: {
    backgroundColor: '#F8FAFC',
    borderColor: '#E2E8F0',
    opacity: 0.85,
  },
  cardExpired: {
    backgroundColor: '#FFFBEB',
    borderColor: '#FDE68A',
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
  checkboxExpired: {
    backgroundColor: '#FEF2F2',
    borderColor: '#EF4444',
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
  expiredBadge: {
    backgroundColor: '#FEE2E2',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  expiredBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#EF4444',
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
  actionButton: {
    padding: 4,
  },
  deleteButton: {
    padding: 2,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 4,
    flexWrap: 'wrap',
  },
  petBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  petBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#2563EB',
  },
  prazoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  prazoText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#0284C7',
  },
  prazoTextDone: {
    color: '#94A3B8',
  },
});
