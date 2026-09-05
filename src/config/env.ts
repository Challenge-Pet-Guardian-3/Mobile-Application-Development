import Constants from 'expo-constants';
import { Platform } from 'react-native';

const getHost = (): string => {
  if (Platform.OS === 'web') return 'localhost';

  const hostUri = Constants.expoConfig?.hostUri;
  const ip = hostUri?.split(':')[0];

  // Ignora adaptadores virtuais internos do Windows/Hyper-V/WSL (172.x.x.x) e loopback
  if (ip && !ip.startsWith('172.') && ip !== 'localhost' && ip !== '127.0.0.1') {
    return ip;
  }

  return '192.168.1.5';
};

const host = getHost();

export const env = {
  apiUrl: `http://${host}:8091`,
  aiUrl: `http://${host}:8000`,
};
