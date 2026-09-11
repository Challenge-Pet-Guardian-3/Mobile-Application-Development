import React, { memo, useState, useEffect } from 'react';
import { View, ActivityIndicator, Text, StyleSheet } from 'react-native';
import { colors } from '../../constants/theme';

interface LoadingSpinnerProps {
  message?: string;
  color?: string;
  size?: 'small' | 'large';
  showCloudNotice?: boolean;
}

export const LoadingSpinner = memo(function LoadingSpinner({
  message = 'Carregando dados...',
  color = colors.primary[600],
  size = 'large',
  showCloudNotice = true,
}: LoadingSpinnerProps) {
  const [isLongWait, setIsLongWait] = useState(false);

  useEffect(() => {
    if (!showCloudNotice) return;
    const timer = setTimeout(() => {
      setIsLongWait(true);
    }, 3500);
    return () => clearTimeout(timer);
  }, [showCloudNotice]);

  return (
    <View style={styles.container}>
      <ActivityIndicator size={size} color={color} />
      {message ? <Text style={styles.message}>{message}</Text> : null}
      {isLongWait && (
        <Text style={styles.cloudNotice}>
          O servidor em nuvem pode levar alguns segundos para inicializar...
        </Text>
      )}
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
    gap: 8,
  },
  message: {
    fontSize: 14,
    color: colors.neutral[600],
    fontWeight: '600',
    textAlign: 'center',
  },
  cloudNotice: {
    fontSize: 11,
    color: colors.neutral[400],
    textAlign: 'center',
    marginTop: 4,
    lineHeight: 15,
  },
});
