import React, { memo, useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
import { shadows } from '../../utils/shadow';
import { TarefaResponse } from '../../types/task';
import { PetResponse } from '../../types/pet';
import { RoutineCard } from '../RoutineCard';
import { colors, spacing, borderRadius } from '../../constants/theme';
import { PaginationControls } from '../PaginationControls';

export interface HeaderActionButton {
  label: string;
  icon?: 'add' | 'chevron-forward';
  variant?: 'primary' | 'link';
  onPress: () => void;
}

export interface TasksRoutineSectionProps {
  title: string;
  subtitle?: string;
  filter: 'HOJE' | 'TODAS';
  onFilterChange: (filter: 'HOJE' | 'TODAS') => void;
  countHoje: number;
  countTodas: number;
  tasks: TarefaResponse[];
  pets?: PetResponse[];
  headerButton?: HeaderActionButton;
  emptyTitle?: string;
  emptyDesc?: string;
  onToggleTask?: (taskId: number) => void;
  onEditTask?: (task: TarefaResponse) => void;
  onDeleteTask?: (taskId: number) => void;
  pageSize?: number;
  pagination?: {
    currentPage: number;
    totalPages: number;
    totalElements?: number;
    onPageChange: (newPage: number) => void;
    isLoading?: boolean;
  };
}

export const TasksRoutineSection = memo(function TasksRoutineSection({
  title,
  subtitle,
  filter,
  onFilterChange,
  countHoje,
  countTodas,
  tasks,
  pets,
  headerButton,
  emptyTitle,
  emptyDesc,
  onToggleTask,
  onEditTask,
  onDeleteTask,
  pageSize,
  pagination,
}: TasksRoutineSectionProps) {
  const [internalPage, setInternalPage] = useState(0);

  // Reseta para a primeira página caso o filtro de visualização mude
  useEffect(() => {
    setInternalPage(0);
  }, [filter]);

  const effectivePageSize = pageSize;
  const isInternalPagination = !!effectivePageSize && !pagination;

  const totalPages = isInternalPagination
    ? Math.max(1, Math.ceil(tasks.length / effectivePageSize))
    : (pagination?.totalPages ?? 1);

  const currentPage = isInternalPagination
    ? Math.min(internalPage, Math.max(0, totalPages - 1))
    : (pagination?.currentPage ?? 0);

  const displayedTasks = isInternalPagination
    ? tasks.slice(currentPage * effectivePageSize, (currentPage + 1) * effectivePageSize)
    : tasks;

  const paginationData = pagination ?? (isInternalPagination ? {
    currentPage,
    totalPages,
    totalElements: tasks.length,
    onPageChange: setInternalPage,
    isLoading: false,
  } : undefined);

  const getPetName = (petId: number): string | undefined => {
    if (!pets || pets.length === 0) return undefined;
    return pets.find((p) => p.id === petId)?.nome;
  };

  const defaultEmptyTitle =
    filter === 'HOJE' ? 'Tudo em dia para hoje!' : 'Nenhuma tarefa cadastrada';
  const defaultEmptyDesc =
    filter === 'HOJE'
      ? 'Nenhuma tarefa agendada para hoje.'
      : 'Crie rotinas diárias para seu pet acumular pontos XP!';

  return (
    <View style={styles.sectionBox}>
      {/* Cabeçalho da Seção */}
      <View style={styles.sectionHeader}>
        <View style={{ flex: 1 }}>
          <Text style={styles.sectionTitle}>{title}</Text>
          {subtitle ? <Text style={styles.sectionSubtitle}>{subtitle}</Text> : null}
        </View>

        {headerButton && (
          <TouchableOpacity
            style={
              headerButton.variant === 'link'
                ? styles.headerButtonLink
                : styles.headerButtonPrimary
            }
            onPress={headerButton.onPress}
            activeOpacity={0.7}
          >
            {headerButton.icon === 'add' && <Ionicons name="add" size={16} color={colors.neutral.white} />}
            <Text
              style={
                headerButton.variant === 'link'
                  ? styles.headerButtonLinkText
                  : styles.headerButtonPrimaryText
              }
            >
              {headerButton.label}
            </Text>
            {headerButton.icon === 'chevron-forward' && (
              <Ionicons name="chevron-forward" size={14} color={colors.primary[600]} />
            )}
          </TouchableOpacity>
        )}
      </View>

      {/* Abas de Filtro: Hoje vs Todas */}
      <View style={styles.filterTabsRow}>
        <TouchableOpacity
          style={[styles.filterTab, filter === 'HOJE' && styles.filterTabActive]}
          onPress={() => onFilterChange('HOJE')}
          activeOpacity={0.7}
        >
          <MaterialCommunityIcons
            name="calendar-today"
            size={14}
            color={filter === 'HOJE' ? colors.primary[600] : colors.neutral[500]}
          />
          <Text style={[styles.filterTabText, filter === 'HOJE' && styles.filterTabTextActive]}>
            Hoje ({countHoje})
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.filterTab, filter === 'TODAS' && styles.filterTabActive]}
          onPress={() => onFilterChange('TODAS')}
          activeOpacity={0.7}
        >
          <MaterialCommunityIcons
            name="format-list-bulleted"
            size={14}
            color={filter === 'TODAS' ? colors.primary[600] : colors.neutral[500]}
          />
          <Text style={[styles.filterTabText, filter === 'TODAS' && styles.filterTabTextActive]}>
            Todas ({countTodas})
          </Text>
        </TouchableOpacity>
      </View>

      {/* Conteúdo / Lista de Tarefas */}
      {tasks.length === 0 ? (
        <View style={styles.emptyBox}>
          <MaterialCommunityIcons name="clipboard-check-outline" size={32} color={colors.neutral[300]} />
          <Text style={styles.emptyTitle}>{emptyTitle || defaultEmptyTitle}</Text>
          <Text style={styles.emptyDesc}>{emptyDesc || defaultEmptyDesc}</Text>
        </View>
      ) : (
        <View style={styles.tasksList}>
          {displayedTasks.map((tarefa) => (
            <RoutineCard
              key={tarefa.id}
              tarefa={tarefa}
              petNome={getPetName(tarefa.petId)}
              onToggle={onToggleTask}
              onEdit={onEditTask}
              onDelete={onDeleteTask}
            />
          ))}
        </View>
      )}

      {paginationData && (
        <PaginationControls
          currentPage={paginationData.currentPage}
          totalPages={paginationData.totalPages}
          totalElements={paginationData.totalElements}
          onPageChange={paginationData.onPageChange}
          isLoading={paginationData.isLoading}
        />
      )}
    </View>
  );
});

const styles = StyleSheet.create({
  sectionBox: {
    backgroundColor: colors.neutral.white,
    borderRadius: borderRadius.xxl,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: 'rgba(226, 232, 240, 0.8)',
    ...shadows.sm,
    elevation: 2,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.neutral[900],
  },
  sectionSubtitle: {
    fontSize: 12,
    color: colors.neutral[500],
    marginTop: 2,
    fontWeight: '500',
  },
  headerButtonPrimary: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.success.default,
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
    borderRadius: borderRadius.md,
    gap: 4,
  },
  headerButtonPrimaryText: {
    color: colors.neutral.white,
    fontWeight: '800',
    fontSize: 12,
  },
  headerButtonLink: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: colors.primary[50],
    paddingVertical: spacing.xs,
    paddingHorizontal: 10,
    borderRadius: borderRadius.md,
  },
  headerButtonLinkText: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.primary[600],
  },
  filterTabsRow: {
    flexDirection: 'row',
    backgroundColor: colors.neutral[50],
    borderRadius: borderRadius.md,
    padding: 4,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.neutral[200],
    gap: spacing.xs,
  },
  filterTab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.sm,
  },
  filterTabActive: {
    backgroundColor: colors.neutral.white,
    ...shadows.sm,
  },
  filterTabText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.neutral[500],
  },
  filterTabTextActive: {
    color: colors.primary[600],
    fontWeight: '700',
  },
  emptyBox: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.xxl,
    paddingHorizontal: spacing.md,
    backgroundColor: colors.neutral[50],
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.neutral[200],
    borderStyle: 'dashed',
  },
  emptyTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.neutral[700],
    marginTop: spacing.sm,
  },
  emptyDesc: {
    fontSize: 12,
    color: colors.neutral[400],
    textAlign: 'center',
    marginTop: 4,
    lineHeight: 18,
  },
  tasksList: {
    gap: 4,
  },
});
