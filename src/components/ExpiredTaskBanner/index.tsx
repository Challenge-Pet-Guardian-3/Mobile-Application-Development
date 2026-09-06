import React, { memo } from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export interface ExpiredTaskBannerProps {
  title?: string;
  description?: string;
  containerStyle?: ViewStyle;
}

export const ExpiredTaskBanner = memo(function ExpiredTaskBanner({
  title = 'Tarefa Expirada',
  description = 'Defina um novo horário futuro no campo de prazo abaixo para reativá-la como pendente na rotina do pet.',
  containerStyle,
}: ExpiredTaskBannerProps) {
  return (
    <View style={[styles.banner, containerStyle]}>
      <View style={styles.iconBox}>
        <Ionicons name="time-outline" size={20} color="#D97706" />
      </View>
      <View style={styles.content}>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.description}>{description}</Text>
      </View>
    </View>
  );
});

const styles = StyleSheet.create({
  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF3C7',
    borderWidth: 1,
    borderColor: '#FDE68A',
    borderRadius: 14,
    padding: 12,
    gap: 10,
    marginBottom: 16,
  },
  iconBox: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#FDE68A',
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 1,
  },
  title: {
    fontSize: 13,
    fontWeight: '700',
    color: '#92400E',
    marginBottom: 2,
  },
  description: {
    fontSize: 12,
    color: '#B45309',
    lineHeight: 16,
  },
});
