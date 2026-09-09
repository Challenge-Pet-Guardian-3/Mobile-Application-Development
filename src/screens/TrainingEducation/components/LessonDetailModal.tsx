import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
import { TrainingLesson } from '../../../types/training';
import { BaseModal } from '../../../components/BaseModal';

interface LessonDetailModalProps {
  visible: boolean;
  licao?: TrainingLesson;
  corTrilha?: string;
  isConcluindo: boolean;
  onClose: () => void;
  onConcluir: () => void;
}

export function LessonDetailModal({
  visible,
  licao,
  corTrilha = '#58CC02',
  isConcluindo,
  onClose,
  onConcluir,
}: LessonDetailModalProps) {
  if (!visible || !licao) return null;

  return (
    <BaseModal
      visible={visible}
      onClose={onClose}
      title={licao.titulo}
      subtitle={licao.descricao}
      size="md"
    >
      <View style={styles.duoBadgeRow}>
        <View style={styles.duoBadgeXP}>
          <MaterialCommunityIcons name="star" size={16} color="#FF9600" />
          <Text style={styles.duoBadgeXPText}>+{licao.pontos} PONTOS XP</Text>
        </View>
      </View>

      <Text style={styles.passosHeader}>Passo a Passo Prático com o Pet:</Text>

      {licao.passos.map((passo, idx) => (
        <View key={idx} style={styles.passoCard}>
          <View style={[styles.passoCircle, { backgroundColor: corTrilha }]}>
            <Text style={styles.passoNumber}>{idx + 1}</Text>
          </View>
          <Text style={styles.passoText}>{passo}</Text>
        </View>
      ))}

      <TouchableOpacity
        style={[
          styles.btnCompletarDuo,
          licao.concluido
            ? { backgroundColor: '#EF4444', opacity: isConcluindo ? 0.7 : 1 }
            : { backgroundColor: corTrilha, opacity: isConcluindo ? 0.7 : 1 },
        ]}
        onPress={onConcluir}
        disabled={isConcluindo}
        activeOpacity={0.8}
      >
        {isConcluindo ? (
          <ActivityIndicator color="#FFF" style={{ marginRight: 8 }} />
        ) : licao.concluido ? (
          <Ionicons name="close-circle-outline" size={22} color="#FFF" style={{ marginRight: 8 }} />
        ) : (
          <Ionicons name="checkmark-done" size={22} color="#FFF" style={{ marginRight: 8 }} />
        )}
        <Text style={styles.btnCompletarDuoText}>
          {isConcluindo
            ? 'Salvando...'
            : licao.concluido
            ? 'Desmarcar Aula Concluída'
            : 'Concluir & Ganhar Pontos!'}
        </Text>
      </TouchableOpacity>
    </BaseModal>
  );
}

const styles = StyleSheet.create({
  duoBadgeRow: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  duoBadgeXP: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#FFFBEB',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#FDE68A',
  },
  duoBadgeXPText: {
    fontSize: 12,
    fontWeight: '900',
    color: '#D97706',
  },
  passosHeader: {
    fontSize: 14,
    fontWeight: '800',
    color: '#334155',
    marginBottom: 10,
  },
  passoCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: 14,
    padding: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  passoCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  passoNumber: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#FFF',
  },
  passoText: {
    flex: 1,
    fontSize: 13,
    color: '#334155',
    fontWeight: '500',
  },
  btnCompletarDuo: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 15,
    borderRadius: 20,
    marginTop: 18,
    borderBottomWidth: 4,
    borderBottomColor: 'rgba(0,0,0,0.2)',
  },
  btnCompletarDuoText: {
    fontSize: 15,
    fontWeight: '900',
    color: '#FFF',
  },
});
