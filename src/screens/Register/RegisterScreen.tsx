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
import { RoleSelector } from '../../components/RoleSelector';
import { useRegisterForm } from '../../hooks/useRegisterForm';

type Props = {
  navigation: NativeStackNavigationProp<AuthStackParamList, 'Register'>;
};

export default function RegisterScreen({ navigation }: Props) {
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
  } = useRegisterForm(navigation);

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