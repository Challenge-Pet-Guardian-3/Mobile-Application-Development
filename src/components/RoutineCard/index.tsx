import React, { memo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
import { shadows } from '../../utils/shadow';
import { TarefaResponse } from '../../types/task';
import { formatarPrazoAmigavel } from '../../utils/petUtils';
import { colors, spacing, borderRadius } from '../../constants/theme';

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
            <Ionicons name="checkmark" size={16} color={colors.neutral.white} />
          ) : isExpired ? (
            <Ionicons name="alert" size={14} color={colors.danger.default} />
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
                <Ionicons name="paw" size={10} color={colors.primary.default} />
                <Text style={styles.petBadgeText} numberOfLines={1}>
                  {petNome}
                </Text>
              </View>
            ) : null}
            {tarefa.prazo ? (
              <View style={styles.prazoRow}>
                <Ionicons name="time-outline" size={12} color={isDone ? colors.neutral[400] : colors.primary.default} />
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
          <Text style={[styles.xpText, isDone && styles.xpTextDone]}>+{tarefa.pontosTarefa} XP</Text>
        </View>

        {onEdit && (
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => onEdit(tarefa)}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Ionicons name="pencil-outline" size={16} color={colors.neutral[400]} />
          </TouchableOpacity>
        )}

        {onDelete && (
          <TouchableOpacity
            style={styles.deleteButton}
            onPress={() => onDelete(tarefa.id)}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Ionicons name="trash-outline" size={16} color={colors.danger.default} />
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
    backgroundColor: colors.neutral.white,
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: borderRadius.lg,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: colors.neutral[200],
    ...shadows.xs,
    elevation: 1,
  },
  cardDone: {
    backgroundColor: colors.neutral[50],
    borderColor: colors.neutral[200],
    opacity: 0.85,
  },
  cardExpired: {
    backgroundColor: colors.warning[50],
    borderColor: colors.warning[200],
  },
  contentLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: spacing.md,
  },
  checkbox: {
    width: 26,
    height: 26,
    borderRadius: 13,
    borderWidth: 2,
    borderColor: colors.neutral[300],
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.neutral.white,
  },
  checkboxInner: {
    width: 0,
    height: 0,
  },
  checkboxDone: {
    backgroundColor: colors.success.default,
    borderColor: colors.success.default,
  },
  checkboxExpired: {
    backgroundColor: colors.danger[50],
    borderColor: colors.danger.default,
  },
  textContainer: {
    flex: 1,
  },
  title: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.neutral[800],
  },
  titleDone: {
    textDecorationLine: 'line-through',
    color: colors.neutral[400],
  },
  expiredBadge: {
    backgroundColor: colors.danger[100],
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: borderRadius.xs,
  },
  expiredBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.danger.default,
  },
  description: {
    fontSize: 12,
    color: colors.neutral[500],
    marginTop: 2,
  },
  descriptionDone: {
    color: colors.neutral[300],
  },
  rightContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  xpBadge: {
    backgroundColor: colors.primary[50],
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 10,
  },
  xpBadgeDone: {
    backgroundColor: colors.success[50],
  },
  xpText: {
    fontSize: 11,
    fontWeight: '800',
    color: colors.primary.default,
  },
  xpTextDone: {
    color: colors.success[600],
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
    gap: spacing.sm,
    marginTop: 4,
    flexWrap: 'wrap',
  },
  petBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: colors.primary[50],
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: borderRadius.xs,
  },
  petBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.primary.default,
  },
  prazoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  prazoText: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.primary[600],
  },
  prazoTextDone: {
    color: colors.neutral[400],
  },
});
