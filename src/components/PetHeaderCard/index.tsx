import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { shadows } from '../../utils/shadow';
import { PetResponse } from '../../types/pet';
import { formatarIdadePet } from '../../utils/petUtils';

export interface PetHeaderCardProps {
  pet: PetResponse;
  isResponsavelPrincipal?: boolean;
  onEdit: () => void;
  onDelete: () => void;
}

export function PetHeaderCard({ pet, isResponsavelPrincipal = true, onEdit, onDelete }: PetHeaderCardProps) {
  return (
    <View style={styles.petHeaderCard}>
      <View style={styles.avatarLargeWrapper}>
        <MaterialCommunityIcons name="paw" size={44} color="#2563EB" />
      </View>

      <Text style={styles.petHeaderName}>{pet.nome}</Text>
      <Text style={styles.petHeaderBreed}>{pet.raca || 'Sem raça definida'}</Text>

      <View style={styles.tagsRow}>
        <View style={styles.tagBadge}>
          <Text style={styles.tagText}>Porte {pet.porte || 'MEDIO'}</Text>
        </View>
        <View style={styles.tagBadge}>
          <Text style={styles.tagText}>{formatarIdadePet(pet.dataNasc)}</Text>
        </View>
        <View style={styles.tagBadge}>
          <Text style={styles.tagText}>{pet.sexo === 'M' ? 'Macho' : 'Fêmea'}</Text>
        </View>
        <View style={[styles.tagBadge, { backgroundColor: pet.castrado ? '#ECFDF5' : '#FFFBEB' }]}>
          <Text style={[styles.tagText, { color: pet.castrado ? '#059669' : '#D97706' }]}>
            {pet.castrado ? 'Castrado' : 'Não castrado'}
          </Text>
        </View>
      </View>

      {isResponsavelPrincipal ? (
        <View style={styles.actionButtonsRow}>
          <TouchableOpacity style={styles.btnEditar} onPress={onEdit} activeOpacity={0.8}>
            <Ionicons name="pencil" size={15} color="#2563EB" />
            <Text style={styles.btnEditarText}>Editar Ficha</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.btnExcluir} onPress={onDelete} activeOpacity={0.8}>
            <Ionicons name="trash-outline" size={15} color="#EF4444" />
            <Text style={styles.btnExcluirText}>Excluir</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View style={styles.coCuidadorNotice}>
          <Ionicons name="shield-checkmark" size={16} color="#0284C7" />
          <Text style={styles.coCuidadorNoticeText}>
            Você é co-cuidador deste pet. Somente o tutor principal pode editar informações ou excluir a ficha.
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  petHeaderCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 22,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(226, 232, 240, 0.8)',
    ...shadows.sm,
    elevation: 2,
  },
  avatarLargeWrapper: {
    width: 84,
    height: 84,
    borderRadius: 42,
    backgroundColor: '#EFF6FF',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
    borderWidth: 2.5,
    borderColor: '#2563EB',
    marginBottom: 12,
  },
  petHeaderName: {
    fontSize: 22,
    fontWeight: '900',
    color: '#0F172A',
  },
  petHeaderBreed: {
    fontSize: 13,
    color: '#64748B',
    marginTop: 2,
    marginBottom: 14,
  },
  tagsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 6,
    marginBottom: 16,
  },
  tagBadge: {
    backgroundColor: '#F1F5F9',
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 10,
  },
  tagText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#334155',
  },
  actionButtonsRow: {
    flexDirection: 'row',
    gap: 10,
    width: '100%',
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    paddingTop: 14,
  },
  btnEditar: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 11,
    borderRadius: 12,
    backgroundColor: '#EFF6FF',
    gap: 6,
  },
  btnEditarText: {
    color: '#2563EB',
    fontWeight: '800',
    fontSize: 12,
  },
  btnExcluir: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 11,
    borderRadius: 12,
    backgroundColor: '#FEF2F2',
    gap: 6,
  },
  btnExcluirText: {
    color: '#EF4444',
    fontWeight: '800',
    fontSize: 12,
  },
  coCuidadorNotice: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    width: '100%',
    backgroundColor: '#F0F9FF',
    borderWidth: 1,
    borderColor: '#BAE6FD',
    borderRadius: 14,
    paddingVertical: 10,
    paddingHorizontal: 12,
    marginTop: 4,
  },
  coCuidadorNoticeText: {
    flex: 1,
    fontSize: 11,
    fontWeight: '600',
    color: '#0369A1',
    lineHeight: 15,
  },
});
