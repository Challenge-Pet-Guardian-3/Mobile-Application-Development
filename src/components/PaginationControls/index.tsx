import React, { memo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, borderRadius } from '../../constants/theme';

export interface PaginationControlsProps {
  currentPage: number; // 0-indexed (Spring Data standard)
  totalPages: number;
  totalElements?: number;
  onPageChange: (newPage: number) => void;
  isLoading?: boolean;
}

export const PaginationControls = memo(function PaginationControls({
  currentPage,
  totalPages,
  totalElements,
  onPageChange,
  isLoading = false,
}: PaginationControlsProps) {
  if (totalPages <= 1) return null;

  const isFirst = currentPage <= 0;
  const isLast = currentPage >= totalPages - 1;

  const handlePrev = () => {
    if (!isFirst && !isLoading) {
      onPageChange(currentPage - 1);
    }
  };

  const handleNext = () => {
    if (!isLast && !isLoading) {
      onPageChange(currentPage + 1);
    }
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={[styles.pageButton, isFirst && styles.pageButtonDisabled]}
        onPress={handlePrev}
        disabled={isFirst || isLoading}
        activeOpacity={0.7}
        accessibilityRole="button"
        accessibilityLabel="Página anterior"
      >
        <Ionicons
          name="chevron-back"
          size={16}
          color={isFirst ? colors.neutral[400] : colors.neutral[700]}
        />
        <Text style={[styles.pageButtonText, isFirst && styles.pageButtonTextDisabled]}>
          Anterior
        </Text>
      </TouchableOpacity>

      <View style={styles.pageIndicatorBox}>
        <Text style={styles.pageIndicatorText}>
          Página <Text style={styles.pageCurrentText}>{currentPage + 1}</Text> de{' '}
          <Text style={styles.pageTotalText}>{totalPages}</Text>
        </Text>
        {totalElements !== undefined ? (
          <Text style={styles.totalElementsText}>({totalElements} {totalElements === 1 ? 'item' : 'itens'})</Text>
        ) : null}
      </View>

      <TouchableOpacity
        style={[styles.pageButton, isLast && styles.pageButtonDisabled]}
        onPress={handleNext}
        disabled={isLast || isLoading}
        activeOpacity={0.7}
        accessibilityRole="button"
        accessibilityLabel="Próxima página"
      >
        <Text style={[styles.pageButtonText, isLast && styles.pageButtonTextDisabled]}>
          Próxima
        </Text>
        <Ionicons
          name="chevron-forward"
          size={16}
          color={isLast ? colors.neutral[400] : colors.neutral[700]}
        />
      </TouchableOpacity>
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.xs,
    marginTop: spacing.xs,
    borderTopWidth: 1,
    borderTopColor: colors.neutral[100],
  },
  pageButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: borderRadius.md,
    backgroundColor: colors.neutral[100],
  },
  pageButtonDisabled: {
    backgroundColor: 'transparent',
    opacity: 0.5,
  },
  pageButtonText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.neutral[700],
  },
  pageButtonTextDisabled: {
    color: colors.neutral[400],
  },
  pageIndicatorBox: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  pageIndicatorText: {
    fontSize: 12,
    color: colors.neutral[500],
    fontWeight: '500',
  },
  pageCurrentText: {
    fontWeight: '800',
    color: colors.primary[600],
  },
  pageTotalText: {
    fontWeight: '700',
    color: colors.neutral[700],
  },
  totalElementsText: {
    fontSize: 10,
    color: colors.neutral[400],
    marginTop: 1,
  },
});
