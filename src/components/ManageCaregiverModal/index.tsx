import React, { memo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { CuidadorResumo } from '../../types/user';
import { PetResponse } from '../../types/pet';
import { shadows } from '../../utils/shadow';
import { BaseModal } from '../BaseModal';

export interface ManageCaregiverModalProps {
  visible: boolean;
  onClose: () => void;
  cuidador: CuidadorResumo | null;
  petsOndeSouPrincipal: PetResponse[];
  onTogglePetVinculo: (petId: number, isCurrentlyLinked: boolean) => void;
  onTransferirTitularidade: (petId: number, petNome: string) => void;
  onRemoverDeTodosPets: () => void;
  isLoading?: boolean;
}

export const ManageCaregiverModal = memo(function ManageCaregiverModal({
  visible,
  onClose,
  cuidador,
  petsOndeSouPrincipal,
  onTogglePetVinculo,
  onTransferirTitularidade,
  onRemoverDeTodosPets,
  isLoading = false,
}: ManageCaregiverModalProps) {
  if (!cuidador) return null;

  const initials = cuidador.nome.substring(0, 2).toUpperCase();

  const handlePressTransfer = (pet: PetResponse) => {
    Alert.alert(
      'Transferir Titularidade',
      `Tem certeza de que deseja transferir a titularidade de ${pet.nome} para ${cuidador.nome}?\n\nEle passará a ser o único tutor principal deste pet e você continuará colaborando como co-cuidador. Seus outros animais não serão afetados.`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Confirmar Transferência',
          style: 'destructive',
          onPress: () => onTransferirTitularidade(pet.id, pet.nome),
        },
      ]
    );
  };

  const handlePressRemoveAll = () => {
    Alert.alert(
      'Remover Co-Cuidador',
      `Deseja realmente desvincular ${cuidador.nome} de todos os seus animais sob seu cuidado principal?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Remover de Todos',
          style: 'destructive',
          onPress: onRemoverDeTodosPets,
        },
      ]
    );
  };

  return (
    <BaseModal
      visible={visible}
      onClose={onClose}
      title={cuidador.nome}
      subtitle={cuidador.email}
      size="md"
    >
      {/* Badge Informativo de Regras */}
      <View style={styles.infoBadgeBox}>
        <Ionicons name="shield-checkmark-outline" size={16} color="#2563EB" />
        <Text style={styles.infoBadgeText}>
          Cada animal possui apenas 1 tutor principal. Marque abaixo com quais dos seus pets este cuidador colabora.
        </Text>
      </View>

      <Text style={styles.sectionSubtitle}>
        Vínculo com seus animais ({petsOndeSouPrincipal.length})
      </Text>

      {petsOndeSouPrincipal.length === 0 ? (
        <View style={styles.emptyBox}>
          <Text style={styles.emptyText}>Você não é tutor principal de nenhum animal cadastrado.</Text>
        </View>
      ) : (
        petsOndeSouPrincipal.map((pet) => {
          const isLinked = cuidador.petIds.includes(pet.id);

          return (
            <View key={pet.id} style={[styles.petRow, isLinked && styles.petRowActive]}>
              <TouchableOpacity
                style={styles.petToggleLeft}
                onPress={() => onTogglePetVinculo(pet.id, isLinked)}
                activeOpacity={0.7}
                disabled={isLoading}
              >
                <View style={[styles.checkbox, isLinked && styles.checkboxActive]}>
                  {isLinked && <Ionicons name="checkmark" size={14} color="#FFFFFF" />}
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.petName, isLinked && styles.petNameActive]}>
                    {pet.nome}
                  </Text>
                  <Text style={styles.petBreed}>
                    {pet.raca} • {isLinked ? 'Co-cuidando ativamente' : 'Não vinculado'}
                  </Text>
                </View>
              </TouchableOpacity>

              {/* Botão de Transferir Titularidade deste pet */}
              {isLinked && (
                <TouchableOpacity
                  style={styles.btnTransferCrown}
                  onPress={() => handlePressTransfer(pet)}
                  activeOpacity={0.7}
                  disabled={isLoading}
                >
                  <MaterialCommunityIcons name="crown-outline" size={16} color="#D97706" />
                  <Text style={styles.btnTransferCrownText}>Passar Titularidade</Text>
                </TouchableOpacity>
              )}
            </View>
          );
        })
      )}

      {/* Ação Destrutiva em Massa */}
      {cuidador.petIds.length > 0 && (
        <TouchableOpacity
          style={styles.btnRemoveAll}
          onPress={handlePressRemoveAll}
          activeOpacity={0.7}
          disabled={isLoading}
        >
          <Ionicons name="trash-outline" size={16} color="#EF4444" />
          <Text style={styles.btnRemoveAllText}>
            Desvincular de todos os animais
          </Text>
        </TouchableOpacity>
      )}

      {/* Rodapé de Ação */}
      <View style={styles.footer}>
        {isLoading ? (
          <ActivityIndicator color="#2563EB" style={{ marginVertical: 8 }} />
        ) : (
          <TouchableOpacity style={styles.btnDone} onPress={onClose} activeOpacity={0.8}>
            <Text style={styles.btnDoneText}>Concluir</Text>
          </TouchableOpacity>
        )}
      </View>
    </BaseModal>
  );
});

const styles = StyleSheet.create({
  infoBadgeBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#EFF6FF',
    padding: 10,
    borderRadius: 14,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#DBEAFE',
  },
  infoBadgeText: {
    flex: 1,
    fontSize: 11,
    color: '#1E40AF',
    fontWeight: '600',
    lineHeight: 15,
  },
  bodyScroll: {
    maxHeight: 320,
  },
  sectionSubtitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#334155',
    marginBottom: 10,
  },
  emptyBox: {
    padding: 16,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 12,
    color: '#94A3B8',
    textAlign: 'center',
  },
  petRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F8FAFC',
    padding: 12,
    borderRadius: 14,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    gap: 8,
  },
  petRowActive: {
    backgroundColor: '#FFFFFF',
    borderColor: '#93C5FD',
  },
  petToggleLeft: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 6,
    borderWidth: 1.5,
    borderColor: '#CBD5E1',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
  },
  checkboxActive: {
    backgroundColor: '#2563EB',
    borderColor: '#2563EB',
  },
  petName: {
    fontSize: 13,
    fontWeight: '700',
    color: '#475569',
  },
  petNameActive: {
    color: '#0F172A',
  },
  petBreed: {
    fontSize: 11,
    color: '#94A3B8',
    marginTop: 1,
  },
  btnTransferCrown: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#FFFBEB',
    paddingVertical: 5,
    paddingHorizontal: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#FDE68A',
  },
  btnTransferCrownText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#B45309',
  },
  btnRemoveAll: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: '#FEF2F2',
    paddingVertical: 10,
    borderRadius: 12,
    marginTop: 12,
    borderWidth: 1,
    borderColor: '#FEE2E2',
  },
  btnRemoveAllText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#DC2626',
  },
  footer: {
    marginTop: 14,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  btnDone: {
    backgroundColor: '#0F172A',
    paddingVertical: 12,
    borderRadius: 14,
    alignItems: 'center',
  },
  btnDoneText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
});
