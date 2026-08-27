import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useSession } from '../hooks/useSession';
import { LoadingSpinner } from '../components/LoadingSpinner';

import WelcomeScreen from '../screens/Welcome/WelcomeScreen';
import LoginScreen from '../screens/Login/LoginScreen';
import RegisterScreen from '../screens/Register/RegisterScreen';
import Tabs from './tabs';

const Stack = createNativeStackNavigator();

export default function MainStack() {
  const { isAuthenticated, isLoading } = useSession();

  if (isLoading) {
    return <LoadingSpinner message="Autenticando sessão..." />;
  }

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {!isAuthenticated ? (
        // Fluxo de Autenticação
        <>
          <Stack.Screen name="Welcome" component={WelcomeScreen} />
          <Stack.Screen name="Login" component={LoginScreen} />
          <Stack.Screen name="Register" component={RegisterScreen} />
        </>
      ) : (
        // Fluxo Principal do App Protegido
        <Stack.Screen name="Tabs" component={Tabs} />
      )}
    </Stack.Navigator>
  );
}