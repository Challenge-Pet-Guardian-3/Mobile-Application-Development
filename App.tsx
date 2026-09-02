import React, { useEffect } from 'react';
import { Platform, View, StyleSheet } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from './src/contexts/AuthContext';
import MainStack from './src/routes/MainStack';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 2,
      staleTime: 1000 * 60 * 5,
    },
  },
});

// No RN Web, "flex: 1" só funciona em cascata se toda a cadeia de pais até o
// <body> tiver altura definida. Sem isso, telas com layout tipo o do
// AiAssistantScreen (sidebar + coluna de chat com scroll interno) colapsam e
// o conteúdo flutua/desalinha, mesmo funcionando normalmente no mobile.
// Injetamos isso via JS (em vez de editar index.html) porque funciona tanto
// no bundler webpack quanto no Metro web do Expo, sem depender de qual dos
// dois o projeto usa.
function useWebHeightFix() {
  useEffect(() => {
    if (Platform.OS !== 'web') return;

    const styleTag = document.createElement('style');
    styleTag.id = 'petguardian-web-height-fix';
    styleTag.innerHTML = `
      html, body, #root {
        height: 100%;
      }
      body {
        margin: 0;
      }
    `;
    document.head.appendChild(styleTag);

    return () => {
      document.getElementById('petguardian-web-height-fix')?.remove();
    };
  }, []);
}

export default function App() {
  useWebHeightFix();

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <NavigationContainer>
          {/* flex: 1 aqui garante que a raiz do app tenha altura real para
              propagar aos flex:1 das telas internas (web) */}
          <View style={styles.root}>
            <MainStack />
          </View>
        </NavigationContainer>
      </AuthProvider>
    </QueryClientProvider>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
});