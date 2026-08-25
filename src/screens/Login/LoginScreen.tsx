import React, { useState, useCallback } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, Platform, KeyboardAvoidingView, ScrollView, ActivityIndicator } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { LoginSchema } from '../../utils/schemas';
import { useAuth } from '../../contexts/AuthContext';
import { api } from '../../services/api';
import { z } from 'zod';

type Props = {
  navigation: NativeStackNavigationProp<any>;
};

export default function LoginScreen({ navigation }: Props) {
  const { signIn } = useAuth();

  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [emailErro, setEmailErro] = useState('');
  const [senhaErro, setSenhaErro] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = useCallback(async () => {
    setEmailErro('');
    setSenhaErro('');

    const emailFormatado = email.trim();

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
      setLoading(true);

      // Login real: valida e-mail + senha no backend e recebe um JWT
      const { data } = await api.post('/login', { email: emailFormatado, senha });

      await signIn(data.token, { id: data.id, nome: data.nome, email: data.email });
    } catch (e: any) {
      if (e.response?.status === 401) {
        setSenhaErro('E-mail ou senha inválidos.');
        Alert.alert('Erro no Login', 'E-mail ou senha inválidos.');
      } else {
        Alert.alert('Erro de Conexão', 'Não foi possível conectar ao servidor Java. Verifique se a API está rodando.');
      }
    } finally {
      setLoading(false);
    }
  }, [email, senha, signIn]);

  return (
    <KeyboardAvoidingView style={styles.mainContainer} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        <View style={styles.contentWrapper}>

          <View style={styles.headerContainer}>
            <Text style={{ fontSize: 40, marginBottom: 10 }}>🐾</Text>
            <Text style={styles.title}>PetGuardian</Text>
            <Text style={styles.subtitle}>Bem-vindo de volta!</Text>
          </View>

          <View style={styles.formContainer}>

            <Text style={styles.inputLabel}>E-mail</Text>
            <TextInput
              style={[styles.input, emailErro !== '' ? styles.inputErro : null]}
              placeholder="seu@email.com"
              placeholderTextColor="#A0AEC0"
              keyboardType="email-address"
              autoCapitalize="none"
              value={email}
              onChangeText={(texto) => {
                setEmail(texto);
                setEmailErro('');
              }}
            />
            {emailErro !== '' && <Text style={styles.erroTexto}>{emailErro}</Text>}

            <Text style={styles.inputLabel}>Senha</Text>
            <TextInput
              style={[styles.input, senhaErro !== '' ? styles.inputErro : null]}
              placeholder="Sua senha"
              placeholderTextColor="#A0AEC0"
              secureTextEntry
              value={senha}
              onChangeText={(texto) => {
                setSenha(texto);
                setSenhaErro('');
              }}
            />
            {senhaErro !== '' && <Text style={styles.erroTexto}>{senhaErro}</Text>}

            <TouchableOpacity
              style={[styles.button, styles.buttonShadow, loading && { opacity: 0.7 }]}
              onPress={handleLogin}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text style={styles.buttonText}>Entrar</Text>
              )}
            </TouchableOpacity>

            <View style={styles.footer}>
              <Text style={styles.footerText}>Ainda não tem conta? </Text>
              <TouchableOpacity onPress={() => navigation.navigate('Register')}>
                <Text style={styles.linkText}>Criar conta</Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity style={{ marginTop: 20, alignItems: 'center' }} onPress={() => navigation.goBack()}>
              <Text style={{ color: '#A0AEC0', fontSize: 14 }}>← Voltar</Text>
            </TouchableOpacity>

          </View>

        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  mainContainer: { flex: 1, backgroundColor: '#F8FAFC' },
  scrollContainer: { flexGrow: 1, justifyContent: 'center', alignItems: 'center', padding: 24 },
  contentWrapper: { width: '100%', maxWidth: 400, alignItems: 'center' },
  headerContainer: { alignItems: 'center', marginBottom: 30, marginTop: 10 },
  title: { fontSize: 32, fontWeight: '900', color: '#1A202C', marginBottom: 8 },
  subtitle: { fontSize: 16, color: '#718096', textAlign: 'center' },
  formContainer: { width: '100%', backgroundColor: '#FFFFFF', padding: 24, borderRadius: 24, borderWidth: 1, borderColor: '#EDF2F7', elevation: 3 },
  inputLabel: { fontSize: 14, fontWeight: '600', color: '#4A5568', marginBottom: 8, marginLeft: 4 },
  input: { backgroundColor: '#F7FAFC', borderWidth: 1, borderColor: '#E2E8F0', padding: 16, borderRadius: 16, marginBottom: 20, fontSize: 16, color: '#2D3748' },
  inputErro: { borderColor: '#E53E3E', borderWidth: 1.5, backgroundColor: '#FFF5F5' },
  erroTexto: { color: '#E53E3E', fontSize: 12, marginTop: -15, marginBottom: 15, marginLeft: 8, fontWeight: '500' },
  button: { backgroundColor: '#0066FF', paddingVertical: 18, borderRadius: 16, alignItems: 'center', marginTop: 10 },
  buttonShadow: { elevation: 6 },
  buttonText: { color: '#FFFFFF', fontWeight: 'bold', fontSize: 16 },
  footer: { flexDirection: 'row', justifyContent: 'center', marginTop: 24 },
  footerText: { color: '#718096', fontSize: 15 },
  linkText: { color: '#0066FF', fontWeight: '700', fontSize: 15 }
});