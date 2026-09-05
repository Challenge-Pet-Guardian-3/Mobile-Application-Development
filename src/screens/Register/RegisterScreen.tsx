import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Platform,
  KeyboardAvoidingView,
  ScrollView,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { AuthStackParamList } from '../../routes/types';
import { Ionicons } from '@expo/vector-icons';
import { useRegisterMutation, getAuthErrorMessage } from '../../hooks/useAuthMutations';
import { CustomInput } from '../../components/CustomInput';
import { CustomButton } from '../../components/CustomButton';
import { shadows } from '../../utils/shadow';
import { PasswordInput } from '../../components/PasswordInput';
import { AuthHeader } from '../../components/AuthHeader';
import { AuthFooter } from '../../components/AuthFooter';
import { RoleSelector } from '../../components/RoleSelector';
import { UsuarioRole } from '../../types/user';
import { RegisterSchema, formatZodError } from '../../utils/schemas';

type Props = {
  navigation: NativeStackNavigationProp<AuthStackParamList, 'Register'>;
};

export default function RegisterScreen({ navigation }: Props) {
  const { mutate: register, isPending, error: mutationError, reset: resetMutation } = useRegisterMutation();

  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [confirmarSenha, setConfirmarSenha] = useState('');
  const [ddd, setDdd] = useState('');
  const [numeroTelefone, setNumeroTelefone] = useState('');
  const [role, setRole] = useState<UsuarioRole>('PREMIUM');
  const [cep, setCep] = useState('');
  const [numero, setNumero] = useState('');
  const [validacaoErro, setValidacaoErro] = useState<string | null>(null);

  const limparErros = useCallback(() => {
    if (validacaoErro) setValidacaoErro(null);
    if (mutationError) resetMutation();
  }, [validacaoErro, mutationError, resetMutation]);

  const handleRegister = useCallback(() => {
    limparErros();

    const dddLimpo = ddd.replace(/\D/g, '');
    const telLimpo = numeroTelefone.replace(/\D/g, '');
    const cepLimpo = cep.replace(/\D/g, '');

    const validacao = RegisterSchema.safeParse({
      nome,
      email,
      ddd: dddLimpo,
      numeroTelefone: telLimpo,
      role,
      cep: cepLimpo,
      numero,
      senha,
      confirmarSenha,
    });

    if (!validacao.success) {
      setValidacaoErro(formatZodError(validacao.error));
      return;
    }

    register({
      nome: validacao.data.nome,
      email: validacao.data.email,
      senha: validacao.data.senha,
      ddd: validacao.data.ddd,
      numeroTelefone: validacao.data.numeroTelefone,
      role: validacao.data.role,
      cep: validacao.data.cep,
      numero: validacao.data.numero,
    });
  }, [nome, email, senha, confirmarSenha, ddd, numeroTelefone, role, cep, numero, register, limparErros]);

  const handleGoBack = useCallback(() => {
    navigation.goBack();
  }, [navigation]);

  const erroExibido = validacaoErro || (mutationError ? getAuthErrorMessage(mutationError) : null);

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
            {/* Seletor de Perfil Reutilizável (COMUM ou PREMIUM) */}
            <RoleSelector
              value={role}
              onChange={(newRole) => setRole(newRole)}
              variant="cards"
              label="Escolha seu Perfil de Tutor:"
            />

            <CustomInput
              label="Nome Completo"
              placeholder="Ex: Carlos Eduardo"
              value={nome}
              onChangeText={(t) => {
                setNome(t);
                limparErros();
              }}
              leftIcon={<Ionicons name="person-outline" size={18} color="#94A3B8" />}
            />

            <CustomInput
              label="E-mail"
              placeholder="seu@email.com"
              keyboardType="email-address"
              autoCapitalize="none"
              value={email}
              onChangeText={(t) => {
                setEmail(t);
                limparErros();
              }}
              leftIcon={<Ionicons name="mail-outline" size={18} color="#94A3B8" />}
            />

            <View style={styles.row}>
              <View style={{ flex: 1, marginRight: 8 }}>
                <CustomInput
                  label="DDD"
                  placeholder="11"
                  keyboardType="numeric"
                  maxLength={2}
                  value={ddd}
                  onChangeText={(t) => {
                    setDdd(t.replace(/\D/g, '').slice(0, 2));
                    limparErros();
                  }}
                />
              </View>
              <View style={{ flex: 3 }}>
                <CustomInput
                  label="Telefone"
                  placeholder="987654321"
                  keyboardType="numeric"
                  maxLength={11}
                  value={numeroTelefone}
                  onChangeText={(t) => {
                    const digits = t.replace(/\D/g, '');
                    if (digits.length === 11 && !ddd) {
                      setDdd(digits.slice(0, 2));
                      setNumeroTelefone(digits.slice(2, 11));
                    } else {
                      setNumeroTelefone(digits.slice(0, 9));
                    }
                    limparErros();
                  }}
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
                  value={cep}
                  onChangeText={(t) => {
                    const digits = t.replace(/\D/g, '').slice(0, 8);
                    const formatted = digits.length > 5 ? `${digits.slice(0, 5)}-${digits.slice(5)}` : digits;
                    setCep(formatted);
                    limparErros();
                  }}
                />
              </View>
              <View style={{ flex: 1 }}>
                <CustomInput
                  label="Número"
                  placeholder="100"
                  value={numero}
                  onChangeText={(t) => {
                    setNumero(t);
                    limparErros();
                  }}
                />
              </View>
            </View>

            <PasswordInput
              label="Senha"
              placeholder="Mínimo 6 caracteres"
              value={senha}
              onChangeText={(t) => {
                setSenha(t);
                limparErros();
              }}
            />

            <PasswordInput
              label="Confirmar Senha"
              placeholder="Repita a senha"
              value={confirmarSenha}
              onChangeText={(t) => {
                setConfirmarSenha(t);
                limparErros();
              }}
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
    ...shadows.sm,
    elevation: 2,
  },
  row: { flexDirection: 'row' },
  erroText: {
    color: '#DC2626',
    fontSize: 13,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 8,
  },
});