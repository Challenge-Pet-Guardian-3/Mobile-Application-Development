import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

interface TaskItemProps {
  id: number;
  title: string;
  time?: string;
  xp?: number;
  isDone?: boolean;
  onToggle: (id: number) => void;
  onEdit?: (id: number) => void;
  onDelete?: (id: number) => void;
}

export const TaskItem: React.FC<TaskItemProps> = ({
  id,
  title,
  time = 'Hoje',
  xp = 15,
  isDone = false,
  onToggle,
  onEdit,
  onDelete,
}) => {
  const formatarHoraOuPrazo = (valor: string) => {
    if (valor.includes('T')) {
      return 'Hoje';
    }
    return valor;
  };

  return (
    <View style={[styles.card, isDone && styles.cardDone]}>
      {/* Botão de Alternar Status */}
      <TouchableOpacity 
        style={styles.checkButton} 
        onPress={() => onToggle(id)}
        activeOpacity={0.7}
      >
        <MaterialCommunityIcons 
          name={isDone ? "check-circle" : "checkbox-blank-circle-outline"} 
          size={24} 
          color={isDone ? "#10B981" : "#CBD5E1"} 
        />
      </TouchableOpacity>

      {/* Título e Prazo */}
      <TouchableOpacity 
        style={styles.textContainer} 
        onPress={() => onToggle(id)}
        activeOpacity={0.8}
      >
        <Text style={[styles.title, isDone && styles.titleDone]} numberOfLines={1}>
          {title}
        </Text>
        <Text style={styles.timeText}>{formatarHoraOuPrazo(time)}</Text>
      </TouchableOpacity>

      {/* Ações: XP, Editar e Deletar */}
      <View style={styles.rightContainer}>
        <Text style={[styles.xpText, isDone && styles.xpDone]}>+{xp} XP</Text>
        
        {/* Botão de Edição */}
        {onEdit && (
          <TouchableOpacity 
            style={styles.editButton} 
            onPress={() => onEdit(id)}
            activeOpacity={0.7}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <MaterialCommunityIcons name="pencil-outline" size={19} color="#0066FF" />
          </TouchableOpacity>
        )}

        {/* Botão de Exclusão */}
        {onDelete && (
          <TouchableOpacity 
            style={styles.deleteButton} 
            onPress={() => onDelete(id)}
            activeOpacity={0.7}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <MaterialCommunityIcons name="trash-can-outline" size={19} color="#EF4444" />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 8,
    gap: 10,
  },
  cardDone: {
    backgroundColor: '#F8FAFC',
    borderColor: '#E2E8F0',
  },
  checkButton: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  textContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  title: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 2,
  },
  titleDone: {
    color: '#64748B',
    textDecorationLine: 'line-through',
  },
  timeText: {
    fontSize: 12,
    color: '#94A3B8',
    fontWeight: '500',
  },
  rightContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  xpText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FF9600',
    marginRight: 2,
  },
  xpDone: {
    color: '#10B981',
  },
  editButton: {
    padding: 6,
    borderRadius: 8,
    backgroundColor: '#EFF6FF',
  },
  deleteButton: {
    padding: 6,
    borderRadius: 8,
    backgroundColor: '#FEE2E2',
  },
});