import { useState, useCallback } from 'react';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { AuthStackParamList } from '../routes/types';
import { useRegisterMutation, getAuthErrorMessage } from './useAuthMutations';
import { RegisterSchema, formatZodError, RegisterFormData } from '../utils/schemas';

const INITIAL_REGISTER_FORM: RegisterFormData = {
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

type NavigationProp = NativeStackNavigationProp<AuthStackParamList, 'Register'>;

export function useRegisterForm(navigation: NavigationProp) {
  const { mutate: register, isPending, error: mutationError, reset: resetMutation } = useRegisterMutation();

  const [form, setForm] = useState<RegisterFormData>(INITIAL_REGISTER_FORM);
  const [validacaoErro, setValidacaoErro] = useState<string | null>(null);

  const limparErros = useCallback(() => {
    if (validacaoErro) setValidacaoErro(null);
    if (mutationError) resetMutation();
  }, [validacaoErro, mutationError, resetMutation]);

  const updateField = useCallback(
    <K extends keyof RegisterFormData>(key: K, value: RegisterFormData[K]) => {
      setForm((prev) => ({ ...prev, [key]: value }));
      limparErros();
    },
    [limparErros]
  );

  const updateDdd = useCallback(
    (text: string) => {
      const clean = text.replace(/\D/g, '').slice(0, 2);
      updateField('ddd', clean);
    },
    [updateField]
  );

  const updateTelefone = useCallback(
    (text: string) => {
      const clean = text.replace(/\D/g, '').slice(0, 9);
      updateField('numeroTelefone', clean);
    },
    [updateField]
  );

  const updateCep = useCallback(
    (text: string) => {
      const digits = text.replace(/\D/g, '').slice(0, 8);
      const formatted = digits.length > 5 ? `${digits.slice(0, 5)}-${digits.slice(5)}` : digits;
      updateField('cep', formatted);
    },
    [updateField]
  );

  const handleRegister = useCallback(() => {
    limparErros();

    const dddLimpo = form.ddd.replace(/\D/g, '');
    const telLimpo = form.numeroTelefone.replace(/\D/g, '');
    const cepLimpo = form.cep.replace(/\D/g, '');

    const validacao = RegisterSchema.safeParse({
      ...form,
      ddd: dddLimpo,
      numeroTelefone: telLimpo,
      cep: cepLimpo,
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
  }, [form, register, limparErros]);

  const handleGoBack = useCallback(() => {
    navigation.goBack();
  }, [navigation]);

  const erroExibido = validacaoErro || (mutationError ? getAuthErrorMessage(mutationError) : null);

  return {
    form,
    updateField,
    updateDdd,
    updateTelefone,
    updateCep,
    handleRegister,
    handleGoBack,
    erroExibido,
    isPending,
  };
}
