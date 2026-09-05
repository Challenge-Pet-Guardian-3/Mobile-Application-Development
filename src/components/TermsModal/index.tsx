import React from 'react';
import { Text, StyleSheet } from 'react-native';
import { BaseModal } from '../BaseModal';

interface TermsModalProps {
  visible: boolean;
  onClose: () => void;
}

export function TermsModal({ visible, onClose }: TermsModalProps) {
  return (
    <BaseModal
      visible={visible}
      onClose={onClose}
      title="Termos & Privacidade"
      subtitle="Diretrizes do ecossistema Clyvo"
    >
      <Text style={styles.termsText}>
        O PetGuardian respeita a privacidade dos dados de sua família e de seus animais de estimação. Todos os registros de saúde e rotina são sincronizados com segurança em nosso backend em nuvem.
      </Text>
      <Text style={[styles.termsText, { marginTop: 10 }]}>
        As recomendações da IA Preventiva possuem caráter orientador e não substituem o diagnóstico de um médico veterinário presencial.
      </Text>
    </BaseModal>
  );
}

const styles = StyleSheet.create({
  termsText: {
    fontSize: 13,
    color: '#475569',
    lineHeight: 20,
  },
});
