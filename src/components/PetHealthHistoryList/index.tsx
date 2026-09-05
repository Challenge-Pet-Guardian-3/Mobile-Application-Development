import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
import { shadows } from '../../utils/shadow';
import { LoadingSpinner } from '../LoadingSpinner';
import { HistoricoResponse } from '../../types/historico';
import { formatarIsoParaBr } from '../../utils/petUtils';

export interface PetHealthHistoryListProps {
  historicos: HistoricoResponse[];
  isLoading?: boolean;
  onAdd: () => void;
  onEdit: (item: HistoricoResponse) => void;
  onDelete: (item: HistoricoResponse) => void;
}

export function PetHealthHistoryList({
  historicos,
  isLoading = false,
  onAdd,
  onEdit,
  onDelete,
}: PetHealthHistoryListProps) {
  const getEventIcon = (tipo: string) => {
    const lower = tipo.toLowerCase();
    if (lower.includes('vacina')) return 'needle';
    if (lower.includes('consulta')) return 'stethoscope';
    if (lower.includes('exame')) return 'flask-outline';
    if (lower.includes('verm') || lower.includes('pulga') || lower.includes('remédio') || lower.includes('medica'))
      return 'pill';
    if (lower.includes('cirurg') || lower.includes('castra')) return 'hospital-box-outline';
    return 'calendar-check-outline';
  };

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <View style={styles.titleRow}>
          <MaterialCommunityIcons name="heart-pulse" size={20} color="#DC2626" />
          <Text style={styles.title}>Prontuário & Saúde ({historicos.length})</Text>
        </View>
        <TouchableOpacity style={styles.btnAdd} onPress={onAdd} activeOpacity={0.7}>
          <Ionicons name="add" size={14} color="#FFFFFF" />
          <Text style={styles.btnAddText}>Registrar</Text>
        </TouchableOpacity>
      </View>

      {isLoading ? (
        <LoadingSpinner message="Buscando prontuário médico..." size="small" />
      ) : historicos.length === 0 ? (
        <View style={styles.emptyBox}>
          <MaterialCommunityIcons name="medical-bag" size={28} color="#CBD5E1" />
          <Text style={styles.emptyTitle}>Nenhum registro de saúde cadastrado</Text>
          <Text style={styles.emptySub}>
            Adicione vacinas, consultas e exames para acompanhar o histórico clínico do pet.
          </Text>
        </View>
      ) : (
        <View style={{ gap: 8 }}>
          {historicos.map((item) => {
            const iconName = getEventIcon(item.tipoHist);
            return (
              <View key={item.id} style={styles.item}>
                <View style={styles.iconWrapper}>
                  <MaterialCommunityIcons name={iconName} size={18} color="#2563EB" />
                </View>

                <View style={styles.infoWrapper}>
                  <Text style={styles.itemTitle} numberOfLines={1}>
                    {item.tipoHist}
                  </Text>
                  <Text style={styles.itemDate}>
                    {formatarIsoParaBr(item.dataHist)}
                  </Text>
                </View>

                {/* Ações de Edição e Exclusão */}
                <View style={styles.actionsRow}>
                  <TouchableOpacity
                    style={styles.actionBtnEdit}
                    onPress={() => onEdit(item)}
                    activeOpacity={0.7}
                    hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                  >
                    <Ionicons name="pencil" size={14} color="#2563EB" />
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.actionBtnDelete}
                    onPress={() => onDelete(item)}
                    activeOpacity={0.7}
                    hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                  >
                    <Ionicons name="trash-outline" size={14} color="#EF4444" />
                  </TouchableOpacity>
                </View>
              </View>
            );
          })}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(226, 232, 240, 0.8)',
    ...shadows.sm,
    elevation: 2,
    gap: 12,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  title: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0F172A',
  },
  btnAdd: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#DC2626',
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 10,
    gap: 4,
  },
  btnAddText: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 11,
  },
  emptyBox: {
    alignItems: 'center',
    padding: 20,
    gap: 4,
  },
  emptyTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#64748B',
  },
  emptySub: {
    fontSize: 11,
    color: '#94A3B8',
    textAlign: 'center',
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
    gap: 10,
  },
  iconWrapper: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#EFF6FF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  infoWrapper: {
    flex: 1,
  },
  itemTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1E293B',
  },
  itemDate: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 2,
  },
  actionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  actionBtnEdit: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#EFF6FF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionBtnDelete: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#FEE2E2',
    justifyContent: 'center',
    alignItems: 'center',
  },
});
