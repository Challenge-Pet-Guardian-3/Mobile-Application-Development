import React, { useCallback } from 'react';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, TouchableOpacity, Platform } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { CustomButton } from '../../components/CustomButton';

type Props = {
  navigation: NativeStackNavigationProp<any>;
};

export default function WelcomeScreen({ navigation }: Props) {
  const handleRegister = useCallback(() => {
    navigation.navigate('Register');
  }, [navigation]);

  const handleLogin = useCallback(() => {
    navigation.navigate('Login');
  }, [navigation]);

  return (
    <View style={styles.container}>
      <StatusBar style="light" />

      <View style={styles.content}>
        {/* Logo e Versão */}
        <View style={styles.headerSection}>
          <View style={styles.logoCircle}>
            <MaterialCommunityIcons name="paw" size={48} color="#FFF" />
          </View>

          <View style={styles.badge}>
            <Text style={styles.badgeText}>• Pet-Centric Clyvo 2026</Text>
          </View>
        </View>

        {/* Títulos */}
        <Text style={styles.title}>PetGuardian</Text>
        <Text style={styles.subtitle}>
          A rotina e os cuidados do seu pet, organizados em família e com IA.
        </Text>

        {/* Chips de Categorias */}
        <View style={styles.chipsRow}>
          <View style={styles.chip}>
            <MaterialCommunityIcons name="heart-pulse" size={14} color="#58CC02" />
            <Text style={styles.chipText}>Saúde do Pet</Text>
          </View>
          <View style={styles.chip}>
            <MaterialCommunityIcons name="calendar-check" size={14} color="#FF9600" />
            <Text style={styles.chipText}>Rotina</Text>
          </View>
          <View style={styles.chip}>
            <MaterialCommunityIcons name="account-group" size={14} color="#0066FF" />
            <Text style={styles.chipText}>Família</Text>
          </View>
        </View>
      </View>

      {/* Ações Inferiores */}
      <View style={styles.footer}>
        <CustomButton
          title="Criar conta grátis →"
          variant="primary"
          onPress={handleRegister}
          style={{ width: '100%', marginBottom: 12 }}
        />

        <CustomButton
          title="Já tenho conta (Entrar)"
          variant="outline"
          onPress={handleLogin}
          style={{ width: '100%', borderColor: 'rgba(255, 255, 255, 0.25)', marginBottom: 20 }}
          textStyle={{ color: '#FFFFFF' }}
        />

        <Text style={styles.legalText}>
          Ao continuar, você concorda com as diretrizes do ecossistema Clyvo.
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#081324',
    paddingHorizontal: 28,
    paddingTop: Platform.OS === 'android' ? 50 : 20,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerSection: {
    alignItems: 'center',
    marginBottom: 20,
  },
  logoCircle: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: '#0066FF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#0066FF',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.5,
    shadowRadius: 16,
    elevation: 8,
  },
  badge: {
    marginTop: 18,
    backgroundColor: 'rgba(0, 102, 255, 0.18)',
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(0, 102, 255, 0.4)',
  },
  badgeText: {
    color: '#38BDF8',
    fontSize: 12,
    fontWeight: 'bold',
    letterSpacing: 0.5,
  },
  title: {
    fontSize: 38,
    fontWeight: '900',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 15,
    color: '#94A3B8',
    textAlign: 'center',
    marginBottom: 28,
    lineHeight: 22,
    paddingHorizontal: 10,
  },
  chipsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.07)',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
    gap: 6,
  },
  chipText: {
    color: '#F8FAFC',
    fontSize: 12,
    fontWeight: '600',
  },
  footer: {
    width: '100%',
    paddingBottom: 35,
    alignItems: 'center',
  },
  legalText: {
    color: 'rgba(255, 255, 255, 0.35)',
    fontSize: 11,
    textAlign: 'center',
  },
});