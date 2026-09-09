import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
import { shadows } from '../../../utils/shadow';
import { LoadingSpinner } from '../../../components/LoadingSpinner';
import { PaginationControls } from '../../../components/PaginationControls';
import { HistoricoResponse } from '../../../types/historico';
import { TarefaResponse } from '../../../types/task';
import { formatarIsoParaBr } from '../../../utils/petUtils';
import { colors, spacing, borderRadius } from '../../../constants/theme';

interface HealthHistoryProps {
  type: 'health';
  items: HistoricoResponse[];
  isLoading?: boolean;
  onAdd: () => void;
  onEdit: (item: HistoricoResponse) => void;
  onDelete: (item: HistoricoResponse) => void;
  pageSize?: number;
}

interface RoutineHistoryProps {
  type: 'routine';
  items: TarefaResponse[];
  isLoading?: boolean;
  pageSize?: number;
  onAdd?: never;
  onEdit?: never;
  onDelete?: never;
}

export type PetHistorySectionProps = HealthHistoryProps | RoutineHistoryProps;

function getEventIcon(tipo: string): keyof typeof MaterialCommunityIcons.glyphMap {
  const lower = tipo.toLowerCase();
  if (lower.includes('vacina')) return 'needle';
  if (lower.includes('consulta')) return 'stethoscope';
  if (lower.includes('exame')) return 'flask-outline';
  if (lower.includes('verm') || lower.includes('pulga') || lower.includes('remédio') || lower.includes('medica'))
    return 'pill';
  if (lower.includes('cirurg') || lower.includes('castra')) return 'hospital-box-outline';
  return 'calendar-check-outline';
}

function formatarDataConclusao(dataStr?: string | null): string {
  if (!dataStr) return 'Concluído';
  try {
    const d = new Date(dataStr);
    return isNaN(d.getTime()) ? 'Concluído' : d.toLocaleDateString('pt-BR');
  } catch {
    return 'Concluído';
  }
}

export function PetHistorySection(props: PetHistorySectionProps) {
  const { type, items, isLoading = false, pageSize = 10 } = props;
  const [currentPage, setCurrentPage] = useState(0);

  const safeItems = items ?? [];
  const totalPages = Math.max(1, Math.ceil(safeItems.length / pageSize));
  const safePage = Math.min(currentPage, Math.max(0, totalPages - 1));
  const displayedItems = safeItems.slice(safePage * pageSize, (safePage + 1) * pageSize);

  const isHealth = type === 'health';

  return (
    <View style={styles.card}>
      {/* Header da Seção */}
      <View style={styles.header}>
        <View style={styles.titleRow}>
          <MaterialCommunityIcons
            name={isHealth ? 'heart-pulse' : 'clipboard-pulse-outline'}
            size={20}
            color={isHealth ? '#DC2626' : '#2563EB'}
          />
          <Text style={styles.title}>
            {isHealth
              ? `Prontuário & Saúde (${safeItems.length})`
              : 'Histórico de Cuidados & Rotina'}
          </Text>
        </View>

        {isHealth && (
          <TouchableOpacity style={styles.btnAdd} onPress={props.onAdd} activeOpacity={0.7}>
            <Ionicons name="add" size={14} color="#FFFFFF" />
            <Text style={styles.btnAddText}>Registrar</Text>
          </TouchableOpacity>
        )}
      </View>

      {isLoading ? (
        <LoadingSpinner
          message={isHealth ? 'Buscando prontuário médico...' : 'Buscando histórico consolidado...'}
          size="small"
        />
      ) : safeItems.length === 0 ? (
        <View style={styles.emptyBox}>
          <MaterialCommunityIcons
            name={isHealth ? 'medical-bag' : 'history'}
            size={28}
            color="#CBD5E1"
          />
          <Text style={styles.emptyTitle}>
            {isHealth ? 'Nenhum registro de saúde' : 'Nenhum registro concluído ainda.'}
          </Text>
          <Text style={styles.emptySubtitle}>
            {isHealth
              ? 'Mantenha vacinas, vermífugos e consultas do seu pet sempre em dia.'
              : 'As rotinas concluídas na Home são sincronizadas aqui!'}
          </Text>
        </View>
      ) : (
        <>
          {isHealth
            ? (displayedItems as HistoricoResponse[]).map((item) => (
                <View key={item.id} style={styles.itemRow}>
                  <View style={styles.iconCircleHealth}>
                    <MaterialCommunityIcons name={getEventIcon(item.tipoHist)} size={18} color="#DC2626" />
                  </View>
                  <View style={styles.itemContent}>
                    <Text style={styles.itemTitle}>{item.tipoHist}</Text>
                    <Text style={styles.itemDate}>
                      {formatarIsoParaBr(item.dataHist) || 'Data não informada'}
                    </Text>
                  </View>
                  <View style={styles.actionButtons}>
                    <TouchableOpacity
                      onPress={() => props.onEdit(item)}
                      style={styles.btnAction}
                      hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                    >
                      <Ionicons name="pencil-outline" size={16} color="#64748B" />
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={() => props.onDelete(item)}
                      style={styles.btnAction}
                      hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                    >
                      <Ionicons name="trash-outline" size={16} color="#EF4444" />
                    </TouchableOpacity>
                  </View>
                </View>
              ))
            : (displayedItems as TarefaResponse[]).map((t) => (
                <View key={t.id} style={styles.itemRow}>
                  <View style={styles.iconCircleRoutine}>
                    <Ionicons name="checkmark-circle" size={18} color="#10B981" />
                  </View>
                  <View style={styles.itemContent}>
                    <Text style={styles.itemTitle}>{t.titulo}</Text>
                    {t.descricao ? <Text style={styles.itemDesc}>{t.descricao}</Text> : null}
                    <Text style={styles.itemDate}>{formatarDataConclusao(t.conclusao)}</Text>
                  </View>
                  <View style={styles.xpBadge}>
                    <Text style={styles.xpText}>+{t.pontosTarefa} XP</Text>
                  </View>
                </View>
              ))}

          {totalPages > 1 && (
            <PaginationControls
              currentPage={safePage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
            />
          )}
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.neutral.white,
    borderRadius: borderRadius.xxl,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.neutral[200],
    ...shadows.sm,
    marginBottom: spacing.md,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  title: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.neutral[900],
  },
  btnAdd: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: colors.danger[600],
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: borderRadius.md,
  },
  btnAddText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.neutral.white,
  },
  emptyBox: {
    alignItems: 'center',
    paddingVertical: spacing.lg,
    gap: 6,
  },
  emptyTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.neutral[700],
  },
  emptySubtitle: {
    fontSize: 12,
    color: colors.neutral[400],
    textAlign: 'center',
    lineHeight: 16,
    paddingHorizontal: spacing.lg,
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.neutral[100],
    gap: 12,
  },
  iconCircleHealth: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.danger[50],
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconCircleRoutine: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.success[50],
    alignItems: 'center',
    justifyContent: 'center',
  },
  itemContent: {
    flex: 1,
  },
  itemTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.neutral[800],
  },
  itemDesc: {
    fontSize: 12,
    color: colors.neutral[500],
    marginTop: 2,
  },
  itemDate: {
    fontSize: 12,
    color: colors.neutral[500],
    marginTop: 2,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  btnAction: {
    padding: 6,
  },
  xpBadge: {
    backgroundColor: colors.success[50],
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: borderRadius.sm,
  },
  xpText: {
    fontSize: 11,
    fontWeight: '800',
    color: colors.success[600],
  },
});
