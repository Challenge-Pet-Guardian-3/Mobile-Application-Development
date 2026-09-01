import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { BaseModal } from '../BaseModal';
import { CustomInput } from '../CustomInput';
import { CustomButton } from '../CustomButton';
import { RoleSelector } from '../RoleSelector';
import { UsuarioRole } from '../../types/user';

export interface EditProfileFormData {
  nome: string;
  email: string;
  role: UsuarioRole;
  ddd: string;
  numeroTelefone: string;
  cep: string;
  numero: string;
  senha?: string;
}

interface EditProfileModalProps {
  visible: boolean;
  onClose: () => void;
  initialData: EditProfileFormData;
  onSubmit: (data: EditProfileFormData) => Promise<void> | void;
  isLoading?: boolean;
}

export function EditProfileModal({
  visible,
  onClose,
  initialData,
  onSubmit,
  isLoading = false,
}: EditProfileModalProps) {
  const [form, setForm] = useState<EditProfileFormData>(initialData);

  useEffect(() => {
    if (visible) {
      setForm(initialData);
    }
  }, [visible, initialData]);

  const handleSubmit = () => {
    if (!form.nome.trim() || !form.email.trim()) {
      Alert.alert('Campos obrigatórios', 'Por favor, preencha nome e e-mail.');
      return;
    }
    onSubmit(form);
  };

  return (
    <BaseModal
      visible={visible}
      onClose={onClose}
      title="Editar Meu Perfil"
      subtitle="Atualize suas informações cadastrais na API Java"
    >
      <RoleSelector
        value={form.role}
        onChange={(r) => setForm((p) => ({ ...p, role: r }))}
        variant="compact"
        label="Perfil do Tutor:"
      />

      <CustomInput
        label="Nome Completo"
        placeholder="Seu nome"
        value={form.nome}
        onChangeText={(t) => setForm((p) => ({ ...p, nome: t }))}
        leftIcon={<Ionicons name="person-outline" size={18} color="#94A3B8" />}
      />

      <CustomInput
        label="E-mail"
        placeholder="seu@email.com"
        keyboardType="email-address"
        autoCapitalize="none"
        value={form.email}
        onChangeText={(t) => setForm((p) => ({ ...p, email: t }))}
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
            onChangeText={(t) => setForm((p) => ({ ...p, ddd: t }))}
          />
        </View>
        <View style={{ flex: 3 }}>
          <CustomInput
            label="Telefone"
            placeholder="987654321"
            keyboardType="numeric"
            maxLength={9}
            value={form.numeroTelefone}
            onChangeText={(t) => setForm((p) => ({ ...p, numeroTelefone: t }))}
          />
        </View>
      </View>

      <View style={styles.row}>
        <View style={{ flex: 2, marginRight: 8 }}>
          <CustomInput
            label="CEP"
            placeholder="01310-100"
            value={form.cep}
            onChangeText={(t) => setForm((p) => ({ ...p, cep: t }))}
          />
        </View>
        <View style={{ flex: 1 }}>
          <CustomInput
            label="Número"
            placeholder="100"
            value={form.numero}
            onChangeText={(t) => setForm((p) => ({ ...p, numero: t }))}
          />
        </View>
      </View>

      <CustomInput
        label="Nova Senha (opcional)"
        placeholder="Deixe em branco para manter a atual"
        secureTextEntry
        value={form.senha || ''}
        onChangeText={(t) => setForm((p) => ({ ...p, senha: t }))}
        leftIcon={<Ionicons name="lock-closed-outline" size={18} color="#94A3B8" />}
      />

      <View style={styles.modalButtonsRow}>
        <CustomButton
          title="Cancelar"
          variant="outline"
          onPress={onClose}
          style={{ flex: 1 }}
        />
        <CustomButton
          title="Salvar Alterações"
          variant="primary"
          isLoading={isLoading}
          onPress={handleSubmit}
          style={{ flex: 1 }}
        />
      </View>
    </BaseModal>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  modalButtonsRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 10,
    marginBottom: 6,
  },
});
