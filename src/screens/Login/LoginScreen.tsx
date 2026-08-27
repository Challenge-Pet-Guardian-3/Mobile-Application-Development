import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Platform,
  KeyboardAvoidingView,
  ScrollView,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
import { useSession } from '../../hooks/useSession';
import { CustomInput } from '../../components/CustomInput';
import { CustomButton } from '../../components/CustomButton';
import { LoginSchema } from '../../utils/schemas';
import { z } from 'zod';

type Props = {
  navigation: NativeStackNavigationProp<any>;
};

const showAlert = (title: string, message: string) => {
  if (Platform.OS === 'web') {
    window.alert(`${title}\n${message}`);
  } else {
    Alert.alert(title, message);
  }
};

export default function LoginScreen({ navigation }: Props) {
  const { login, isLoading } = useSession();

  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [mostrarSenha, setMostrarSenha] = useState(false);

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
    } catch (error: any) {
      const status = error?.response?.status;
      if (status === 404) {
        setEmailErro('E-mail não encontrado na base de dados.');
        showAlert('Usuário não encontrado', 'Verifique o e-mail digitado ou realize seu cadastro.');
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
          <TouchableOpacity style={styles.backButton} onPress={handleGoBack}>
            <Ionicons name="arrow-back" size={20} color="#0F172A" />
          </TouchableOpacity>

          <View style={styles.headerContainer}>
            <View style={styles.iconCircle}>
              <MaterialCommunityIcons name="paw" size={28} color="#2563EB" />
            </View>
            <Text style={styles.title}>PetGuardian</Text>
            <Text style={styles.subtitle}>Acesse sua conta para cuidar do seu pet em família</Text>
          </View>

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

            <CustomInput
              label="Senha"
              placeholder="Sua senha secreta"
              secureTextEntry={!mostrarSenha}
              value={senha}
              onChangeText={(t) => {
                setSenha(t);
                setSenhaErro('');
              }}
              error={senhaErro}
              leftIcon={<Ionicons name="lock-closed-outline" size={18} color="#94A3B8" />}
              rightIcon={
                <TouchableOpacity onPress={() => setMostrarSenha(!mostrarSenha)}>
                  <Ionicons
                    name={mostrarSenha ? 'eye-off-outline' : 'eye-outline'}
                    size={18}
                    color="#94A3B8"
                  />
                </TouchableOpacity>
              }
            />

            <CustomButton
              title="Entrar na Plataforma"
              variant="primary"
              isLoading={isLoading}
              onPress={handleLogin}
              style={{ marginTop: 6 }}
            />

            <View style={styles.footer}>
              <Text style={styles.footerText}>Ainda não tem conta? </Text>
              <TouchableOpacity onPress={handleNavigateToRegister}>
                <Text style={styles.linkText}>Cadastre-se</Text>
              </TouchableOpacity>
            </View>
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
  backButton: {
    alignSelf: 'flex-start',
    padding: 10,
    borderRadius: 14,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: 'rgba(226, 232, 240, 0.8)',
    marginBottom: 16,
  },
  headerContainer: { alignItems: 'center', marginBottom: 20 },
  iconCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#EFF6FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  title: { fontSize: 26, fontWeight: '900', color: '#0F172A', marginBottom: 4 },
  subtitle: { fontSize: 13, color: '#64748B', textAlign: 'center', paddingHorizontal: 15 },
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
  footer: { flexDirection: 'row', justifyContent: 'center', marginTop: 20 },
  footerText: { color: '#64748B', fontSize: 13 },
  linkText: { color: '#2563EB', fontWeight: '800', fontSize: 13 },
});