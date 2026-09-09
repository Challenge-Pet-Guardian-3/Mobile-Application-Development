import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { CustomInput } from '../../../components/CustomInput';
import { PasswordInput } from '../../../components/PasswordInput';
import { CustomButton } from '../../../components/CustomButton';
import { RoleSelector } from '../../../components/RoleSelector';
import { shadows } from '../../../utils/shadow';
import { useRegisterForm } from '../../../hooks/useRegisterForm';

interface RegisterFormProps {
  registerState: ReturnType<typeof useRegisterForm>;
}

export function RegisterForm({ registerState }: RegisterFormProps) {
  const {
    form,
    updateField,
    updateDdd,
    updateTelefone,
    updateCep,
    handleRegister,
    handleGoBack,
    erroExibido,
    isPending,
  } = registerState;

  return (
    <View style={styles.formContainer}>
      <RoleSelector
        value={form.role}
        onChange={(newRole) => updateField('role', newRole)}
        variant="cards"
        label="Escolha seu Perfil de Tutor:"
      />

      <CustomInput
        label="Nome Completo"
        placeholder="Ex: Carlos Eduardo"
        maxLength={60}
        value={form.nome}
        onChangeText={(t) => updateField('nome', t)}
        leftIcon={<Ionicons name="person-outline" size={18} color="#94A3B8" />}
      />

      <CustomInput
        label="E-mail"
        placeholder="seu@email.com"
        keyboardType="email-address"
        autoCapitalize="none"
        maxLength={80}
        value={form.email}
        onChangeText={(t) => updateField('email', t)}
        leftIcon={<Ionicons name="mail-outline" size={18} color="#94A3B8" />}
      />

      <View style={styles.row}>
        <View style={{ flex: 1, marginRight: 8 }}>
          <CustomInput
            label="DDD"
            placeholder="11"
            keyboardType="numeric"
            maxLength={2}
            value={form.ddd}
            onChangeText={updateDdd}
          />
        </View>
        <View style={{ flex: 3 }}>
          <CustomInput
            label="Telefone"
            placeholder="987654321"
            keyboardType="numeric"
            maxLength={9}
            value={form.numeroTelefone}
            onChangeText={updateTelefone}
          />
        </View>
      </View>

      <View style={styles.row}>
        <View style={{ flex: 2, marginRight: 8 }}>
          <CustomInput
            label="CEP"
            placeholder="07749-000"
            keyboardType="numeric"
            maxLength={9}
            value={form.cep}
            onChangeText={updateCep}
          />
        </View>
        <View style={{ flex: 1 }}>
          <CustomInput
            label="Número"
            placeholder="100"
            maxLength={10}
            value={form.numero}
            onChangeText={(t) => updateField('numero', t)}
          />
        </View>
      </View>

      <PasswordInput
        label="Senha"
        placeholder="Mínimo 6 caracteres"
        maxLength={64}
        value={form.senha}
        onChangeText={(t) => updateField('senha', t)}
      />

      <PasswordInput
        label="Confirmar Senha"
        placeholder="Repita a senha"
        maxLength={64}
        value={form.confirmarSenha}
        onChangeText={(t) => updateField('confirmarSenha', t)}
      />

      {erroExibido && <Text style={styles.erroText}>{erroExibido}</Text>}

      <CustomButton
        title={isPending ? 'Cadastrando…' : 'Concluir Cadastro'}
        variant="success"
        isLoading={isPending}
        disabled={isPending}
        onPress={handleRegister}
        style={{ marginTop: 6 }}
      />

      <View style={styles.footer}>
        <Text style={styles.footerText}>Já faz parte de uma família? </Text>
        <TouchableOpacity onPress={handleGoBack} activeOpacity={0.7}>
          <Text style={styles.linkText}>Fazer Login</Text>
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
  row: {
    flexDirection: 'row',
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
