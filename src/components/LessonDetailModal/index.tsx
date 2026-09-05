import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Modal,
} from 'react-native';
import { MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
import { TrainingLesson } from '../../types/training';

interface LessonDetailModalProps {
  visible: boolean;
  licao: TrainingLesson | null;
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
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalCard}>
          <View style={styles.modalTopRow}>
            <View style={styles.duoBadgeXP}>
              <MaterialCommunityIcons name="star" size={16} color="#FF9600" />
              <Text style={styles.duoBadgeXPText}>+{licao.pontos} PONTOS XP</Text>
            </View>
            <TouchableOpacity onPress={onClose} style={{ padding: 4 }} activeOpacity={0.7}>
              <Ionicons name="close-circle" size={28} color="#94A3B8" />
            </TouchableOpacity>
          </View>

          <Text style={styles.modalTitle}>{licao.titulo}</Text>
          <Text style={styles.modalDesc}>{licao.descricao}</Text>

          <Text style={styles.passosHeader}>Passo a Passo Prático com o Pet:</Text>

          <ScrollView style={{ maxHeight: 220 }} showsVerticalScrollIndicator={false}>
            {licao.passos.map((passo, idx) => (
              <View key={idx} style={styles.passoCard}>
                <View style={[styles.passoCircle, { backgroundColor: corTrilha }]}>
                  <Text style={styles.passoNumber}>{idx + 1}</Text>
                </View>
                <Text style={styles.passoText}>{passo}</Text>
              </View>
            ))}
          </ScrollView>

          <TouchableOpacity
            style={[
              styles.btnCompletarDuo,
              { backgroundColor: corTrilha, opacity: isConcluindo ? 0.7 : 1 },
            ]}
            onPress={onConcluir}
            disabled={isConcluindo}
            activeOpacity={0.8}
          >
            {isConcluindo ? (
              <ActivityIndicator color="#FFF" style={{ marginRight: 8 }} />
            ) : (
              <Ionicons name="checkmark-done" size={22} color="#FFF" style={{ marginRight: 8 }} />
            )}
            <Text style={styles.btnCompletarDuoText}>
              {isConcluindo ? 'Salvando...' : 'Concluir & Ganhar Pontos!'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.65)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalCard: {
    backgroundColor: '#FFF',
    width: '100%',
    borderRadius: 28,
    padding: 24,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  modalTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
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
  modalTitle: {
    fontSize: 22,
    fontWeight: '900',
    color: '#0F172A',
    marginBottom: 8,
  },
  modalDesc: {
    fontSize: 14,
    color: '#64748B',
    lineHeight: 20,
    marginBottom: 16,
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
