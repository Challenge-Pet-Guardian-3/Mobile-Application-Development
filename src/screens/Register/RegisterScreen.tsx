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
import { Ionicons } from '@expo/vector-icons';
import { useSession } from '../../hooks/useSession';
import { CustomInput } from '../../components/CustomInput';
import { CustomButton } from '../../components/CustomButton';
import { RoleSelector } from '../../components/RoleSelector';
import { RegisterSchema } from '../../utils/schemas';
import { UsuarioRole } from '../../types/user';
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

export default function RegisterScreen({ navigation }: Props) {
  const { register, isLoading } = useSession();

  const [form, setForm] = useState<{
    nome: string;
    email: string;
    senha: string;
    confirmarSenha: string;
    ddd: string;
    numeroTelefone: string;
    role: UsuarioRole;
    cep: string;
    numero: string;
  }>({
    nome: '',
    email: '',
    senha: '',
    confirmarSenha: '',
    ddd: '11',
    numeroTelefone: '987654321',
    role: 'PREMIUM',
    cep: '01310-100',
    numero: '100',
  });

  const [erros, setErros] = useState<Record<string, string>>({});
  const [mostrarSenha, setMostrarSenha] = useState(false);

  const handleChange = useCallback((campo: keyof typeof form, valor: any) => {
    setForm((prev) => ({ ...prev, [campo]: valor }));
    setErros((prev) => ({ ...prev, [campo]: '' }));
  }, []);

  const handleRegister = useCallback(async () => {
    setErros({});

    const payload = {
      nome: form.nome.trim(),
      email: form.email.trim().toLowerCase(),
      senha: form.senha,
      confirmarSenha: form.confirmarSenha,
      ddd: form.ddd.replace(/\D/g, '') || '11',
      numeroTelefone: form.numeroTelefone.replace(/\D/g, '') || '987654321',
      role: form.role,
      cep: form.cep.replace(/\D/g, '') || '01310100',
      numero: form.numero.trim() || '100',
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
    } catch (e: any) {
      const msg = e?.response?.data?.message || 'Não foi possível cadastrar na API Java. Verifique a conexão.';
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
          <TouchableOpacity style={styles.backButton} onPress={handleGoBack}>
            <Ionicons name="arrow-back" size={20} color="#0F172A" />
          </TouchableOpacity>

          <View style={styles.headerContainer}>
            <Text style={styles.title}>Criar Conta</Text>
            <Text style={styles.subtitle}>Preencha seus dados para conectar sua família ao PetGuardian</Text>
          </View>

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

            <CustomInput
              label="Senha"
              placeholder="Mínimo 6 caracteres"
              secureTextEntry={!mostrarSenha}
              value={form.senha}
              onChangeText={(t) => handleChange('senha', t)}
              error={erros.senha}
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

            <CustomInput
              label="Confirmar Senha"
              placeholder="Repita a senha"
              secureTextEntry={!mostrarSenha}
              value={form.confirmarSenha}
              onChangeText={(t) => handleChange('confirmarSenha', t)}
              error={erros.confirmarSenha}
              leftIcon={<Ionicons name="lock-closed-outline" size={18} color="#94A3B8" />}
            />

            <CustomButton
              title="Concluir Cadastro"
              variant="success"
              isLoading={isLoading}
              onPress={handleRegister}
              style={{ marginTop: 6 }}
            />

            <View style={styles.footer}>
              <Text style={styles.footerText}>Já faz parte de uma família? </Text>
              <TouchableOpacity onPress={handleGoBack}>
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
  row: { flexDirection: 'row' },
  footer: { flexDirection: 'row', justifyContent: 'center', marginTop: 20 },
  footerText: { color: '#64748B', fontSize: 13 },
  linkText: { color: '#2563EB', fontWeight: '800', fontSize: 13 },
});