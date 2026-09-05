import { Platform } from 'react-native';

declare const process: { env: Record<string, string | undefined> };

const defaultApiUrl = Platform.select({
  android: 'http://10.0.2.2:8080',
  ios: 'http://localhost:8080',
  default: 'http://localhost:8080',
});

const defaultAiUrl = Platform.select({
  android: 'http://10.0.2.2:8000',
  ios: 'http://localhost:8000',
  default: 'http://localhost:8000',
});

export const env = {
  apiUrl: process.env.EXPO_PUBLIC_API_URL || defaultApiUrl,
  aiUrl: process.env.EXPO_PUBLIC_AI_URL || defaultAiUrl,
};
