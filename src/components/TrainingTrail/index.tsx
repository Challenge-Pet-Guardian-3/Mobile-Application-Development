import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons, FontAwesome5 } from '@expo/vector-icons';
import { TrainingLesson } from '../../types/training';

interface TrainingTrailProps {
  licoes?: TrainingLesson[];
  corTrilha?: string;
  onSelectLicao: (licao: TrainingLesson) => void;
}

const OFFSETS = [0, 45, -45, 30, -30];

export function TrainingTrail({
  licoes = [],
  corTrilha = '#58CC02',
  onSelectLicao,
}: TrainingTrailProps) {
  return (
    <View style={styles.trailContainer}>
      {licoes.map((licao, index) => {
        const currentOffset = OFFSETS[index % OFFSETS.length];

        return (
          <View
            key={licao.id}
            style={[
              styles.nodeWrapper,
              { transform: [{ translateX: currentOffset }] },
            ]}
          >
            {index > 0 && <View style={styles.nodeConnector} />}

            <TouchableOpacity
              style={[
                styles.nodeButton,
                licao.concluido
                  ? styles.nodeButtonDone
                  : { backgroundColor: corTrilha, borderBottomColor: '#46A302' },
              ]}
              onPress={() => onSelectLicao(licao)}
              activeOpacity={0.75}
            >
              <View style={styles.nodeInnerCircle}>
                {licao.concluido ? (
                  <Ionicons name="checkmark-sharp" size={32} color="#FFF" />
                ) : (
                  <FontAwesome5 name="paw" size={24} color="#FFF" />
                )}
              </View>
            </TouchableOpacity>

            <View style={styles.nodeLabelBox}>
              <Text style={styles.nodeLabelTitle}>{licao.titulo}</Text>
              <Text style={styles.nodeLabelXp}>+{licao.pontos} XP</Text>
            </View>
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  trailContainer: {
    alignItems: 'center',
    paddingVertical: 10,
  },
  nodeWrapper: {
    alignItems: 'center',
    marginBottom: 40,
    position: 'relative',
  },
  nodeConnector: {
    position: 'absolute',
    top: -30,
    width: 8,
    height: 35,
    backgroundColor: '#E2E8F0',
    zIndex: -1,
    borderRadius: 4,
  },
  nodeButton: {
    width: 72,
    height: 72,
    borderRadius: 36,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 6,
    borderBottomWidth: 6,
  },
  nodeButtonDone: {
    backgroundColor: '#E2E8F0',
    borderBottomColor: '#CBD5E1',
  },
  nodeInnerCircle: {
    width: 58,
    height: 58,
    borderRadius: 29,
    justifyContent: 'center',
    alignItems: 'center',
  },
  nodeLabelBox: {
    backgroundColor: '#FFF',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    marginTop: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    alignItems: 'center',
    elevation: 2,
  },
  nodeLabelTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: '#1E293B',
  },
  nodeLabelXp: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#FF9600',
  },
});
