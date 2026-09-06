import React, { memo } from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  ViewStyle,
  TextStyle,
  TouchableOpacityProps,
} from 'react-native';
import { shadows } from '../../utils/shadow';
import { colors, borderRadius } from '../../constants/theme';

interface CustomButtonProps extends TouchableOpacityProps {
  title: string;
  variant?: 'primary' | 'secondary' | 'outline' | 'danger' | 'success';
  isLoading?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
  icon?: React.ReactNode;
}

export const CustomButton = memo(function CustomButton({
  title,
  variant = 'primary',
  isLoading = false,
  style,
  textStyle,
  icon,
  disabled,
  ...rest
}: CustomButtonProps) {
  const getButtonStyle = () => {
    switch (variant) {
      case 'success':
        return styles.btnSuccess;
      case 'secondary':
        return styles.btnSecondary;
      case 'outline':
        return styles.btnOutline;
      case 'danger':
        return styles.btnDanger;
      default:
        return styles.btnPrimary;
    }
  };

  const getTextStyle = () => {
    switch (variant) {
      case 'outline':
        return styles.textOutline;
      case 'secondary':
        return styles.textSecondary;
      default:
        return styles.textPrimary;
    }
  };

  return (
    <TouchableOpacity
      style={[
        styles.btnBase,
        getButtonStyle(),
        (disabled || isLoading) && styles.btnDisabled,
        style,
      ]}
      activeOpacity={0.8}
      disabled={disabled || isLoading}
      {...rest}
    >
      {isLoading ? (
        <ActivityIndicator color={variant === 'outline' ? colors.neutral[900] : colors.neutral.white} size="small" />
      ) : (
        <>
          {icon}
          <Text style={[styles.textBase, getTextStyle(), textStyle]}>{title}</Text>
        </>
      )}
    </TouchableOpacity>
  );
});

const styles = StyleSheet.create({
  btnBase: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderRadius: borderRadius.lg,
    gap: 8,
  },
  btnPrimary: {
    backgroundColor: colors.neutral[900],
    ...shadows.xl,
    elevation: 3,
  },
  btnSuccess: {
    backgroundColor: colors.success.default,
    ...shadows.colored(colors.success.default, 0.25),
    elevation: 3,
  },
  btnSecondary: {
    backgroundColor: colors.primary[50],
  },
  btnOutline: {
    backgroundColor: 'transparent',
    borderWidth: 1.5,
    borderColor: colors.neutral[200],
  },
  btnDanger: {
    backgroundColor: colors.danger.default,
  },
  btnDisabled: {
    opacity: 0.45,
    elevation: 0,
  },
  textBase: {
    fontSize: 15,
    fontWeight: '800',
    letterSpacing: -0.2,
  },
  textPrimary: {
    color: colors.neutral.white,
  },
  textSecondary: {
    color: colors.primary.default,
  },
  textOutline: {
    color: colors.neutral[900],
  },
});
