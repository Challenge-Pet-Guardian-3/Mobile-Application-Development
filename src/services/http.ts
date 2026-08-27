import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { STORAGE_KEYS } from '../constants/Keys';

// Configuração dinâmica da URL base dependendo do ambiente
const getBaseUrl = (): string => {
  // Para emulador Android no PC, 10.0.2.2 mapeia para o localhost da máquina hospedeira
  if (Platform.OS === 'android') {
    return 'http://10.0.2.2:8080';
  }
  // Para iOS Simulator e Web
  return 'http://localhost:8080';
};

export const API_BASE_URL = getBaseUrl();

// Instância centralizada do Axios
export const http = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
});

// Interceptor de Request: Injeção de Bearer Token JWT
http.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    try {
      const token = await AsyncStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
      if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (error) {
      console.warn('[HTTP] Erro ao recuperar token do storage:', error);
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Callback para notificar expiração de sessão
let onUnauthorizedCallback: (() => void) | null = null;

export const setOnUnauthorizedCallback = (callback: () => void) => {
  onUnauthorizedCallback = callback;
};

// Interceptor de Response: Captura 401 e formata erros
http.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    if (error.response) {
      const status = error.response.status;

      // 401: Sessão expirada ou não autorizada
      if (status === 401) {
        console.warn('[HTTP] Erro 401 - Sessão expirada ou não autorizada.');
        try {
          await AsyncStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN);
          await AsyncStorage.removeItem(STORAGE_KEYS.LOGADO);
        } catch (e) {
          // ignore
        }
        if (onUnauthorizedCallback) {
          onUnauthorizedCallback();
        }
      }
    }
    return Promise.reject(error);
  }
);
