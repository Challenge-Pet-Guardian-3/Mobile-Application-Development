import React from 'react';
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
import { CustomInput } from '../../components/CustomInput';
import { CustomButton } from '../../components/CustomButton';
import { shadows } from '../../utils/shadow';
import { PasswordInput } from '../../components/PasswordInput';
import { AuthHeader } from '../../components/AuthHeader';
import { AuthFooter } from '../../components/AuthFooter';
import { useLoginForm } from '../../hooks/useLoginForm';

type Props = {
  navigation: NativeStackNavigationProp<AuthStackParamList, 'Login'>;
};

export default function LoginScreen({ navigation }: Props) {
  const {
    form,
    updateField,
    handleLogin,
    handleNavigateToRegister,
    handleGoBack,
    mensagemErro,
    isPending,
  } = useLoginForm(navigation);

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
});