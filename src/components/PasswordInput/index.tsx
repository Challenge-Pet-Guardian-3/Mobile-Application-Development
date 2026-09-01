import React, { useState, memo } from 'react';
import { TouchableOpacity, TextInputProps, ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { CustomInput } from '../CustomInput';

interface PasswordInputProps extends TextInputProps {
  label?: string;
  error?: string;
  containerStyle?: ViewStyle;
}

export const PasswordInput = memo(function PasswordInput({
  label = 'Senha',
  placeholder = 'Sua senha secreta',
  ...rest
}: PasswordInputProps) {
  const [mostrarSenha, setMostrarSenha] = useState(false);

  return (
    <CustomInput
      label={label}
      placeholder={placeholder}
      secureTextEntry={!mostrarSenha}
      leftIcon={<Ionicons name="lock-closed-outline" size={18} color="#94A3B8" />}
      rightIcon={
        <TouchableOpacity
          onPress={() => setMostrarSenha((prev) => !prev)}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Ionicons
            name={mostrarSenha ? 'eye-off-outline' : 'eye-outline'}
            size={18}
            color="#94A3B8"
          />
        </TouchableOpacity>
      }
      {...rest}
    />
  );
});
