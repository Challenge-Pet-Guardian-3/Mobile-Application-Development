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
import { LoginSchema } from '../../utils/schemas';
import { showAlert } from '../../utils/alert';
import { z } from 'zod';
import axios from 'axios';

type Props = {
  navigation: NativeStackNavigationProp<any>;
};

export default function LoginScreen({ navigation }: Props) {
  const { login, isLoading } = useSession();

  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');

  const [emailErro, setEmailErro] = useState('');
  const [senhaErro, setSenhaErro] = useState('');

  const handleLogin = useCallback(async () => {
    setEmailErro('');
    setSenhaErro('');

    const emailFormatado = email.trim().toLowerCase();

    try {
      LoginSchema.parse({ email: emailFormatado, senha });
    } catch (error) {
      if (error instanceof z.ZodError) {
        error.issues.forEach((err) => {
          if (err.path[0] === 'email') setEmailErro(err.message);
          if (err.path[0] === 'senha') setSenhaErro(err.message);
        });
      }
      return;
    }

    try {
      await login({ email: emailFormatado, senha });
    } catch (error: unknown) {
      const status = axios.isAxiosError(error) ? error.response?.status : undefined;
      if (status === 401) {
        setEmailErro('E-mail ou senha incorretos.');
        showAlert('Acesso negado', 'Verifique suas credenciais e tente novamente.');
      } else if (status && status >= 500) {
        showAlert('Erro de Servidor', 'Serviço indisponível. Tente mais tarde.');
      } else {
        showAlert('Erro de Conexão', 'Não foi possível conectar à API Java Spring Boot.');
      }
    }
  }, [email, senha, login]);

  const handleNavigateToRegister = useCallback(() => {
    navigation.navigate('Register');
  }, [navigation]);

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
            title="PetGuardian"
            subtitle="Acesse sua conta para cuidar do seu pet em família"
            onBack={handleGoBack}
          />

          <View style={styles.formContainer}>
            <CustomInput
              label="E-mail"
              placeholder="seu@email.com"
              keyboardType="email-address"
              autoCapitalize="none"
              value={email}
              onChangeText={(t) => {
                setEmail(t);
                setEmailErro('');
              }}
              error={emailErro}
              leftIcon={<Ionicons name="mail-outline" size={18} color="#94A3B8" />}
            />

            <PasswordInput
              label="Senha"
              placeholder="Sua senha secreta"
              value={senha}
              onChangeText={(t) => {
                setSenha(t);
                setSenhaErro('');
              }}
              error={senhaErro}
            />

            <CustomButton
              title="Entrar na Plataforma"
              variant="primary"
              isLoading={isLoading}
              onPress={handleLogin}
              style={{ marginTop: 6 }}
            />

            <AuthFooter
              text="Ainda não tem conta?"
              actionText="Cadastre-se"
              onAction={handleNavigateToRegister}
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
});