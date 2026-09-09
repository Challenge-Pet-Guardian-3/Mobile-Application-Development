import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { CustomInput } from '../../../components/CustomInput';
import { PasswordInput } from '../../../components/PasswordInput';
import { CustomButton } from '../../../components/CustomButton';
import { shadows } from '../../../utils/shadow';
import { useLoginForm } from '../../../hooks/useLoginForm';

interface LoginFormProps {
  loginState: ReturnType<typeof useLoginForm>;
}

export function LoginForm({ loginState }: LoginFormProps) {
  const {
    form,
    updateField,
    handleLogin,
    handleNavigateToRegister,
    mensagemErro,
    isPending,
  } = loginState;

  return (
    <View style={styles.formContainer}>
      <CustomInput
        label="E-mail"
        placeholder="seu@email.com"
        keyboardType="email-address"
        autoCapitalize="none"
        value={form.email}
        onChangeText={(t) => updateField('email', t)}
        leftIcon={<Ionicons name="mail-outline" size={18} color="#94A3B8" />}
      />

      <PasswordInput
        label="Senha"
        placeholder="Sua senha secreta"
        value={form.senha}
        onChangeText={(t) => updateField('senha', t)}
      />

      {mensagemErro && <Text style={styles.erroText}>{mensagemErro}</Text>}

      <CustomButton
        title={isPending ? 'Entrando…' : 'Entrar na Plataforma'}
        variant="primary"
        isLoading={isPending}
        disabled={isPending}
        onPress={handleLogin}
        style={{ marginTop: 6 }}
      />

      <View style={styles.footer}>
        <Text style={styles.footerText}>Ainda não tem conta? </Text>
        <TouchableOpacity onPress={handleNavigateToRegister} activeOpacity={0.7}>
          <Text style={styles.linkText}>Cadastre-se</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  formContainer: {
    backgroundColor: '#FFFFFF',
    padding: 24,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(226, 232, 240, 0.8)',
    ...shadows.sm,
    elevation: 2,
  },
  erroText: {
    color: '#DC2626',
    fontSize: 13,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 8,
  },
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
