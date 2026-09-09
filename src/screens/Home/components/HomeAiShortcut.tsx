import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
import { colors, spacing, borderRadius } from '../../../constants/theme';
import { shadows } from '../../../utils/shadow';

interface HomeAiShortcutProps {
  onPress: () => void;
}

export function HomeAiShortcut({ onPress }: HomeAiShortcutProps) {
  return (
    <TouchableOpacity style={styles.shortcutCard} onPress={onPress} activeOpacity={0.85}>
      <View style={[styles.shortcutIconBox, { backgroundColor: colors.primary[50] }]}>
        <MaterialCommunityIcons name="robot-outline" size={22} color={colors.primary[600]} />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={styles.shortcutTitle}>IA Assistente Preventiva</Text>
        <Text style={styles.shortcutSub}>Orientações contextuais de saúde, nutrição e rotina do pet</Text>
      </View>
      <Ionicons name="arrow-forward" size={16} color={colors.primary[600]} />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  shortcutCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.neutral.white,
    borderRadius: borderRadius.xxl,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: 'rgba(226, 232, 240, 0.8)',
    gap: 14,
    ...shadows.sm,
  },
  shortcutIconBox: {
    width: 44,
    height: 44,
    borderRadius: borderRadius.lg,
    justifyContent: 'center',
    alignItems: 'center',
  },
  shortcutTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.neutral[900],
  },
  shortcutSub: {
    fontSize: 12,
    color: colors.neutral[500],
    marginTop: 2,
  },
});
