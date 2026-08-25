import React, { useCallback } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert, Platform, Share, ActivityIndicator } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useFamily } from '../../hooks/useFamily';

const maxWidth = 400;

type Props = {
  navigation: NativeStackNavigationProp<any>;
};

export default function AddMemberScreen({ navigation }: Props) {
  const { familia, isLoading } = useFamily();

  const compartilhar = useCallback(async () => {
    const mensagem = `Entra na nossa família no PetGuardian! Usa o código: ${familia.codigoConvite}`;

    if (Platform.OS === 'web') {
      try {
        await navigator.clipboard.writeText(familia.codigoConvite);
        window.alert('Código copiado! Agora é só compartilhar com quem você quer convidar.');
      } catch {
        window.alert(`Código de convite: ${familia.codigoConvite}`);
      }
      return;
    }

    try {
      await Share.share({ message: mensagem });
    } catch {
      Alert.alert('Código de convite', familia.codigoConvite);
    }
  }, [familia.codigoConvite]);

  const handleCancel = useCallback(() => {
    navigation.goBack();
  }, [navigation]);

  if (isLoading) {
    return (
      <View style={styles.mainContainer}>
        <ActivityIndicator size="large" color="#0066ff" />
      </View>
    );
  }

  if (!familia.ativa) {
    return (
      <View style={styles.mainContainer}>
        <View style={styles.contentContainer}>
          <Text style={styles.title}>Convidar Familiar</Text>
          <Text style={styles.infoText}>
            Você ainda não faz parte de uma família. Crie ou entre em uma família antes de convidar alguém.
          </Text>
          <TouchableOpacity style={styles.btn} onPress={handleCancel}>
            <Text style={styles.btnText}>Voltar</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.mainContainer}>
      <View style={styles.contentContainer}>
        <Text style={styles.title}>Convidar Familiar</Text>

        <Text style={styles.infoText}>
          Compartilhe o código abaixo com quem você quer que entre na família{' '}
          <Text style={{ fontWeight: 'bold' }}>{familia.nome}</Text>. A pessoa precisa ter uma conta no PetGuardian e usar esse código na tela de "Entrar em Família".
        </Text>

        <View style={styles.codeBox}>
          <Text style={styles.codeText}>{familia.codigoConvite}</Text>
        </View>

        <TouchableOpacity style={styles.btn} onPress={compartilhar}>
          <Text style={styles.btnText}>Compartilhar Código</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={handleCancel}>
          <Text style={{ marginTop: 15, textAlign: 'center', color: '#666' }}>Voltar</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  mainContainer: { flex: 1, alignItems: 'center', backgroundColor: '#f5f5f5', justifyContent: 'center' },
  contentContainer: { width: '100%', maxWidth, padding: 20 },
  title: { fontSize: 22, marginBottom: 20, fontWeight: 'bold', textAlign: 'center', color: '#1E293B' },
  infoText: { fontSize: 14, color: '#475569', textAlign: 'center', marginBottom: 20, lineHeight: 20 },
  codeBox: { backgroundColor: '#EBF4FF', borderWidth: 1, borderColor: '#0066ff', borderRadius: 10, padding: 20, alignItems: 'center', marginBottom: 20 },
  codeText: { fontSize: 28, fontWeight: 'bold', color: '#0066ff', letterSpacing: 2 },
  btn: { backgroundColor: '#0066ff', padding: 15, borderRadius: 10, alignItems: 'center' },
  btnText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
});