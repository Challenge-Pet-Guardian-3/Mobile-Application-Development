import React, { memo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
import { shadows } from '../../utils/shadow';
import { TarefaResponse } from '../../types/task';
import { PetResponse } from '../../types/pet';
import { RoutineCard } from '../RoutineCard';

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
}: TasksRoutineSectionProps) {
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
            {headerButton.icon === 'add' && <Ionicons name="add" size={16} color="#FFFFFF" />}
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
              <Ionicons name="chevron-forward" size={14} color="#2563EB" />
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
            color={filter === 'HOJE' ? '#2563EB' : '#64748B'}
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
            color={filter === 'TODAS' ? '#2563EB' : '#64748B'}
          />
          <Text style={[styles.filterTabText, filter === 'TODAS' && styles.filterTabTextActive]}>
            Todas ({countTodas})
          </Text>
        </TouchableOpacity>
      </View>

      {/* Conteúdo / Lista de Tarefas */}
      {tasks.length === 0 ? (
        <View style={styles.emptyBox}>
          <MaterialCommunityIcons name="clipboard-check-outline" size={32} color="#CBD5E1" />
          <Text style={styles.emptyTitle}>{emptyTitle || defaultEmptyTitle}</Text>
          <Text style={styles.emptyDesc}>{emptyDesc || defaultEmptyDesc}</Text>
        </View>
      ) : (
        <View style={styles.tasksList}>
          {tasks.map((tarefa) => (
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
    </View>
  );
});

const styles = StyleSheet.create({
  sectionBox: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 18,
    borderWidth: 1,
    borderColor: 'rgba(226, 232, 240, 0.8)',
    ...shadows.sm,
    elevation: 2,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0F172A',
  },
  sectionSubtitle: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
    fontWeight: '500',
  },
  headerButtonPrimary: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#10B981',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 12,
    gap: 4,
  },
  headerButtonPrimaryText: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 12,
  },
  headerButtonLink: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#EFF6FF',
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 12,
  },
  headerButtonLinkText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#2563EB',
  },
  filterTabsRow: {
    flexDirection: 'row',
    backgroundColor: '#F8FAFC',
    borderRadius: 14,
    padding: 4,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    gap: 6,
  },
  filterTab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 8,
    borderRadius: 10,
  },
  filterTabActive: {
    backgroundColor: '#FFFFFF',
    ...shadows.sm,
  },
  filterTabText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748B',
  },
  filterTabTextActive: {
    color: '#2563EB',
    fontWeight: '700',
  },
  emptyBox: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 26,
    paddingHorizontal: 16,
    backgroundColor: '#F8FAFC',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderStyle: 'dashed',
  },
  emptyTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#334155',
    marginTop: 8,
  },
  emptyDesc: {
    fontSize: 12,
    color: '#94A3B8',
    textAlign: 'center',
    marginTop: 4,
    lineHeight: 18,
  },
  tasksList: {
    gap: 4,
  },
});
