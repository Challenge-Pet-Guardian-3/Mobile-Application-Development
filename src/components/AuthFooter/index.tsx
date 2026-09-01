import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';

interface AuthFooterProps {
  text: string;
  actionText: string;
  onAction: () => void;
}

export function AuthFooter({ text, actionText, onAction }: AuthFooterProps) {
  return (
    <View style={styles.footer}>
      <Text style={styles.footerText}>{text} </Text>
      <TouchableOpacity onPress={onAction} activeOpacity={0.7}>
        <Text style={styles.linkText}>{actionText}</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 20,
    alignItems: 'center',
  },
  footerText: {
    color: '#64748B',
    fontSize: 13,
  },
  linkText: {
    color: '#2563EB',
    fontWeight: '800',
    fontSize: 13,
  },
});
