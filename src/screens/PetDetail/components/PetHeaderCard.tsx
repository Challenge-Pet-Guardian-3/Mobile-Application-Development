import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { shadows } from '../../../utils/shadow';
import { PetResponse } from '../../../types/pet';
import { formatarIdadePet } from '../../../utils/petUtils';

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
    padding: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    ...shadows.sm,
    marginBottom: 16,
  },
  avatarLargeWrapper: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: '#EFF6FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
    borderWidth: 3,
    borderColor: '#DBEAFE',
  },
  petHeaderName: {
    fontSize: 22,
    fontWeight: '900',
    color: '#0F172A',
    marginBottom: 2,
  },
  petHeaderBreed: {
    fontSize: 14,
    color: '#64748B',
    fontWeight: '600',
    marginBottom: 14,
  },
  tagsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    justifyContent: 'center',
    marginBottom: 18,
  },
  tagBadge: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  tagText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#475569',
  },
  actionButtonsRow: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
    paddingTop: 14,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  btnEditar: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    backgroundColor: '#EFF6FF',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#BFDBFE',
  },
  btnEditarText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#2563EB',
  },
  btnExcluir: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    backgroundColor: '#FEF2F2',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#FECACA',
  },
  btnExcluirText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#EF4444',
  },
  coCuidadorNotice: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#F0F9FF',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#BAE6FD',
    marginTop: 6,
  },
  coCuidadorNoticeText: {
    flex: 1,
    fontSize: 12,
    color: '#0369A1',
    lineHeight: 16,
    fontWeight: '500',
  },
});
