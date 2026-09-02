import React from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { useAuth } from '../contexts/AuthContext';

// Telas Públicas (Deslogado)
import WelcomeScreen from '../screens/Welcome/WelcomeScreen';
import LoginScreen from '../screens/Login/LoginScreen';
import RegisterScreen from '../screens/Register/RegisterScreen';

// Telas Protegidas (Logado)
import Tabs from './tabs';
import ClinicsSearchScreen from '../screens/Clinics/ClinicsSearchScreen';
import AiAssistantScreen from '../screens/AiAssistant/AiAssistantScreen';

const Stack = createNativeStackNavigator();

export default function MainStack() {
  const { token, isLoading } = useAuth();

  // Enquanto verifica o AsyncStorage, exibe um loading nativo
  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0066FF" />
      </View>
    );
  }

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {token ? (
        // 🔒 Rotas Protegidas: Inacessíveis para quem não tem token
        <Stack.Group>
          <Stack.Screen name="Tabs" component={Tabs} />
          <Stack.Screen name="Clinics" component={ClinicsSearchScreen} />
          <Stack.Screen name="AiAssistant" component={AiAssistantScreen} />
        </Stack.Group>
      ) : (
        // 🔓 Rotas Públicas: Fluxo de entrada e autenticação
        <Stack.Group>
          <Stack.Screen name="Welcome" component={WelcomeScreen} />
          <Stack.Screen name="Login" component={LoginScreen} />
          <Stack.Screen name="Register" component={RegisterScreen} />
        </Stack.Group>
      )}
    </Stack.Navigator>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#081324',
  },
});