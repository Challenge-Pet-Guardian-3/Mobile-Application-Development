import React, { useState, useCallback } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, Platform, KeyboardAvoidingView, ScrollView, ActivityIndicator } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RegisterSchema } from '../../utils/schemas';
import { api } from '../../services/api';
import { z } from 'zod';

type Props = {
  navigation: NativeStackNavigationProp<any>;
};

export default function RegisterScreen({ navigation }: Props) {
  const [form, setForm] = useState({
    nome: '',
    email: '',
    senha: '',
    confirmarSenha: ''
  });

  const [erros, setErros] = useState({
    nome: '',
    email: '',
    senha: '',
    confirmarSenha: ''
  });

  const [loading, setLoading] = useState(false);

  const handleChange = useCallback((campo: keyof typeof form, valor: string) => {
    setForm(prev => ({ ...prev, [campo]: valor }));
    setErros(prev => ({ ...prev, [campo]: '' }));
  }, []);

  const handleRegister = useCallback(async () => {
    setErros({ nome: '', email: '', senha: '', confirmarSenha: '' });

    try {
      RegisterSchema.parse({
        nome: form.nome.trim(),
        email: form.email.trim(),
        senha: form.senha,
        confirmarSenha: form.confirmarSenha
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        const novosErros = { nome: '', email: '', senha: '', confirmarSenha: '' };
        error.issues.forEach((err) => {
          const field = err.path[0] as keyof typeof novosErros;
          if (field) {
            novosErros[field] = err.message;
          }
        });
        setErros(novosErros);
      }
      return;
    }

    try {
      setLoading(true);

      // Payload exatamente como o Java UsuarioRequest espera
      const payload = {
        nome: form.nome.trim(),
        email: form.email.trim(),
        senha: form.senha,
        ddd: "11",
        numeroTelefone: "987654321",
        endereco: {
          cep: "01310100",
          numero: "100"
        }
      };

      await api.post('/usuarios', payload);

      if (Platform.OS === 'web') {
        window.alert('Conta criada com sucesso! Faça login para continuar.');
      } else {
        Alert.alert('Sucesso!', 'Conta criada com sucesso! Faça login para continuar.');
      }
      navigation.navigate('Login');
    } catch (e: any) {
      const msg = e.response?.data?.message || 'Não foi possível cadastrar na API Java. Verifique a conexão com o servidor.';
      if (Platform.OS === 'web') {
        window.alert(msg);
      } else {
        Alert.alert('Erro ao Cadastrar', msg);
      }
    } finally {
      setLoading(false);
    }
  }, [form, navigation]);

  return (
    <KeyboardAvoidingView style={styles.mainContainer} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        <View style={styles.contentWrapper}>

          <View style={styles.headerContainer}>
            <Text style={styles.title}>Criar Conta</Text>
            <Text style={styles.subtitle}>Preencha seus dados para começar a usar o PetGuardian.</Text>
          </View>

          <View style={styles.formContainer}>

            <Text style={styles.inputLabel}>Seu Nome</Text>
            <TextInput
              style={[styles.input, erros.nome !== '' ? styles.inputErro : null]}
              placeholder="Como quer ser chamado?"
              placeholderTextColor="#A0AEC0"
              value={form.nome}
              onChangeText={(texto) => handleChange('nome', texto)}
            />
            {erros.nome !== '' && <Text style={styles.erroTexto}>{erros.nome}</Text>}

            <Text style={styles.inputLabel}>E-mail</Text>
            <TextInput
              style={[styles.input, erros.email !== '' ? styles.inputErro : null]}
              placeholder="seu@email.com"
              placeholderTextColor="#A0AEC0"
              keyboardType="email-address"
              autoCapitalize="none"
              value={form.email}
              onChangeText={(texto) => handleChange('email', texto)}
            />
            {erros.email !== '' && <Text style={styles.erroTexto}>{erros.email}</Text>}

            <Text style={styles.inputLabel}>Senha</Text>
            <TextInput
              style={[styles.input, erros.senha !== '' ? styles.inputErro : null]}
              placeholder="Crie uma senha forte (mínimo 6 dígitos)"
              placeholderTextColor="#A0AEC0"
              secureTextEntry
              value={form.senha}
              onChangeText={(texto) => handleChange('senha', texto)}
            />
            {erros.senha !== '' && <Text style={styles.erroTexto}>{erros.senha}</Text>}

            <Text style={styles.inputLabel}>Confirmar Senha</Text>
            <TextInput
              style={[styles.input, erros.confirmarSenha !== '' ? styles.inputErro : null]}
              placeholder="Digite a senha novamente"
              placeholderTextColor="#A0AEC0"
              secureTextEntry
              value={form.confirmarSenha}
              onChangeText={(texto) => handleChange('confirmarSenha', texto)}
            />
            {erros.confirmarSenha !== '' && <Text style={styles.erroTexto}>{erros.confirmarSenha}</Text>}

            <TouchableOpacity 
              style={[styles.button, styles.buttonShadow, loading && { opacity: 0.7 }]} 
              onPress={handleRegister}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text style={styles.buttonText}>Cadastrar no Servidor</Text>
              )}
            </TouchableOpacity>

            <View style={styles.footer}>
              <Text style={styles.footerText}>Já tem uma conta? </Text>
              <TouchableOpacity onPress={() => navigation.navigate('Login')}>
                <Text style={styles.linkText}>Fazer Login</Text>
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
  contentWrapper: { width: '100%', maxWidth: 400, alignItems: 'center' },
  headerContainer: { alignItems: 'center', marginBottom: 30, marginTop: 10 },
  title: { fontSize: 28, fontWeight: '800', color: '#1A202C', marginBottom: 8 },
  subtitle: { fontSize: 16, color: '#718096', textAlign: 'center', paddingHorizontal: 10 },
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