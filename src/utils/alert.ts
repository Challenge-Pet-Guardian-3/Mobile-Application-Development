import { Alert, Platform } from 'react-native';

/**
 * Utilitário unificado para exibição de alertas compatível com Web, Android e iOS.
 * Reduz duplicação de código (DRY) entre telas de autenticação e formulários.
 */
export const showAlert = (title: string, message: string) => {
  if (Platform.OS === 'web') {
    if (typeof window !== 'undefined' && window.alert) {
      window.alert(`${title}\n${message}`);
    } else {
      console.log(`[ALERT] ${title}: ${message}`);
    }
  } else {
    Alert.alert(title, message);
  }
};
