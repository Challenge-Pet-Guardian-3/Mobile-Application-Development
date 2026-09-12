import React, { memo } from 'react';
import { View, Text, TextInput, StyleSheet, TextInputProps, ViewStyle } from 'react-native';
import { shadows } from '../../utils/shadow';
import { colors, borderRadius } from '../../constants/theme';

interface CustomInputProps extends TextInputProps {
  label?: string;
  error?: string;
  containerStyle?: ViewStyle;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const CustomInput = memo(function CustomInput({
  label,
  error,
  containerStyle,
  leftIcon,
  rightIcon,
  style,
  ...rest
}: CustomInputProps) {
  const hasError = !!error;

  return (
    <View style={[styles.container, containerStyle]}>
      {label && <Text style={styles.label}>{label}</Text>}
      <View style={[styles.inputWrapper, hasError && styles.inputError]}>
        {leftIcon && <View style={styles.leftIconWrapper}>{leftIcon}</View>}
        <TextInput
          style={[styles.input, style]}
          placeholderTextColor={colors.neutral[400]}
          {...rest}
        />
        {rightIcon && <View style={styles.rightIconWrapper}>{rightIcon}</View>}
      </View>
      {hasError && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    marginBottom: 14,
    width: '100%',
  },
  label: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.neutral[700],
    marginBottom: 6,
    marginLeft: 2,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.neutral.white,
    borderWidth: 1,
    borderColor: colors.neutral[200],
    borderRadius: borderRadius.lg,
    paddingHorizontal: 14,
    minHeight: 50,
    ...shadows.xs,
    elevation: 1,
  },
  inputError: {
    borderColor: colors.danger.default,
    backgroundColor: colors.danger[50],
  },
  input: {
    flex: 1,
    fontSize: 14,
    color: colors.neutral[900],
    paddingVertical: 10,
  },
  leftIconWrapper: {
    marginRight: 8,
  },
  rightIconWrapper: {
    marginLeft: 8,
  },
  errorText: {
    color: colors.danger.default,
    fontSize: 11,
    marginTop: 4,
    marginLeft: 4,
    fontWeight: '600',
  },
});
