import React, { useState, useCallback } from 'react';
import {
  View,
  StyleSheet,
  Platform,
  KeyboardAvoidingView,
  ScrollView,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { useSession } from '../../hooks/useSession';
import { CustomInput } from '../../components/CustomInput';
import { CustomButton } from '../../components/CustomButton';
import { PasswordInput } from '../../components/PasswordInput';
import { AuthHeader } from '../../components/AuthHeader';
import { AuthFooter } from '../../components/AuthFooter';
import { RoleSelector } from '../../components/RoleSelector';
import { RegisterSchema, RegisterFormData } from '../../utils/schemas';
import { showAlert } from '../../utils/alert';
import { z } from 'zod';

import axios from 'axios';

type Props = {
  navigation: NativeStackNavigationProp<any>;
};

const INITIAL_FORM: RegisterFormData = {
  nome: '',
  email: '',
  senha: '',
  confirmarSenha: '',
  ddd: '',
  numeroTelefone: '',
  role: 'PREMIUM',
  cep: '',
  numero: '',
};

export default function RegisterScreen({ navigation }: Props) {
  const { register, isLoading } = useSession();

  const [form, setForm] = useState<RegisterFormData>(INITIAL_FORM);
  const [erros, setErros] = useState<Record<string, string>>({});

  const handleChange = useCallback(
    <K extends keyof RegisterFormData>(campo: K, valor: RegisterFormData[K]) => {
      setForm((prev) => ({ ...prev, [campo]: valor }));
      setErros((prev) => ({ ...prev, [campo]: '' }));
    },
    []
  );

  const handleRegister = useCallback(async () => {
    setErros({});

    const payload = {
      nome: form.nome.trim(),
      email: form.email.trim().toLowerCase(),
      senha: form.senha,
      confirmarSenha: form.confirmarSenha,
      ddd: form.ddd.replace(/\D/g, ''),
      numeroTelefone: form.numeroTelefone.replace(/\D/g, ''),
      role: form.role,
      cep: form.cep.replace(/\D/g, ''),
      numero: form.numero.trim(),
    };

    try {
      RegisterSchema.parse(payload);
    } catch (error) {
      if (error instanceof z.ZodError) {
        const novosErros: Record<string, string> = {};
        error.issues.forEach((err) => {
          const field = err.path[0] as string;
          if (field) {
            novosErros[field] = err.message;
          }
        });
        setErros(novosErros);
      }
      return;
    }

    try {
      await register({
        nome: payload.nome,
        email: payload.email,
        senha: payload.senha,
        ddd: payload.ddd,
        numeroTelefone: payload.numeroTelefone,
        role: payload.role,
        cep: payload.cep,
        numero: payload.numero,
      });
      showAlert('Sucesso!', 'Sua conta foi criada com sucesso!');
    } catch (e: unknown) {
      let msg = 'Não foi possível cadastrar na API Java. Verifique a conexão.';
      if (axios.isAxiosError(e)) {
        msg = e.response?.data?.message || msg;
      }
      showAlert('Erro no Cadastro', msg);
    }
  }, [form, register]);

  const handleGoBack = useCallback(() => {
    navigation.goBack();
  }, [navigation]);

  return (
    <KeyboardAvoidingView
      style={styles.mainContainer}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        <View style={styles.contentWrapper}>
          <AuthHeader
            title="Criar Conta"
            subtitle="Preencha seus dados para conectar sua família ao PetGuardian"
            onBack={handleGoBack}
            showIcon={false}
          />

          <View style={styles.formContainer}>
            {/* Seletor de Perfil Reutilizável (DRY / Clean Code) */}
            <RoleSelector
              value={form.role}
              onChange={(newRole) => handleChange('role', newRole)}
              variant="cards"
              label="Escolha seu Perfil de Tutor:"
            />

            <CustomInput
              label="Nome Completo"
              placeholder="Ex: Carlos Eduardo"
              value={form.nome}
              onChangeText={(t) => handleChange('nome', t)}
              error={erros.nome}
              leftIcon={<Ionicons name="person-outline" size={18} color="#94A3B8" />}
            />

            <CustomInput
              label="E-mail"
              placeholder="seu@email.com"
              keyboardType="email-address"
              autoCapitalize="none"
              value={form.email}
              onChangeText={(t) => handleChange('email', t)}
              error={erros.email}
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
                  onChangeText={(t) => handleChange('ddd', t)}
                  error={erros.ddd}
                />
              </View>
              <View style={{ flex: 3 }}>
                <CustomInput
                  label="Telefone"
                  placeholder="987654321"
                  keyboardType="numeric"
                  maxLength={9}
                  value={form.numeroTelefone}
                  onChangeText={(t) => handleChange('numeroTelefone', t)}
                  error={erros.numeroTelefone}
                />
              </View>
            </View>

            <View style={styles.row}>
              <View style={{ flex: 2, marginRight: 8 }}>
                <CustomInput
                  label="CEP"
                  placeholder="01310-100"
                  value={form.cep}
                  onChangeText={(t) => handleChange('cep', t)}
                  error={erros.cep}
                />
              </View>
              <View style={{ flex: 1 }}>
                <CustomInput
                  label="Número"
                  placeholder="100"
                  value={form.numero}
                  onChangeText={(t) => handleChange('numero', t)}
                  error={erros.numero}
                />
              </View>
            </View>

            <PasswordInput
              label="Senha"
              placeholder="Mínimo 6 caracteres"
              value={form.senha}
              onChangeText={(t) => handleChange('senha', t)}
              error={erros.senha}
            />

            <PasswordInput
              label="Confirmar Senha"
              placeholder="Repita a senha"
              value={form.confirmarSenha}
              onChangeText={(t) => handleChange('confirmarSenha', t)}
              error={erros.confirmarSenha}
            />

            <CustomButton
              title="Concluir Cadastro"
              variant="success"
              isLoading={isLoading}
              onPress={handleRegister}
              style={{ marginTop: 6 }}
            />

            <AuthFooter
              text="Já faz parte de uma família?"
              actionText="Fazer Login"
              onAction={handleGoBack}
            />
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  mainContainer: { flex: 1, backgroundColor: '#F8FAFC' },
  scrollContainer: { flexGrow: 1, justifyContent: 'center', alignItems: 'center', padding: 24 },
  contentWrapper: { width: '100%', maxWidth: 420 },
  formContainer: {
    backgroundColor: '#FFFFFF',
    padding: 24,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(226, 232, 240, 0.8)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.03,
    shadowRadius: 10,
    elevation: 2,
  },
  row: { flexDirection: 'row' },
});