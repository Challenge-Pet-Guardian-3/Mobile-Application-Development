import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import { StorageService } from './storage';
import { env } from '../config/env';
import { ApiError, ApiErrorResponse } from '../types/api';

// Instância centralizada do Axios
export const http = axios.create({
  baseURL: env.apiUrl,
  timeout: 12000,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
});

// Interceptor de Request: Injeção de Bearer Token JWT do Storage Seguro
http.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    try {
      const token = await StorageService.getToken();
      if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (error) {
      console.log('[HTTP] Erro ao recuperar token seguro do storage:', error);
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

// Interceptor de Response: Captura 401 e normaliza erros para ApiError (padrão mockmerce-app-prof)
http.interceptors.response.use(
  (response) => response,
  async (error: AxiosError<ApiErrorResponse>) => {
    const status = error.response?.status ?? 0;
    const data = error.response?.data;
    const fullUrl = `${error.config?.baseURL || ''}${error.config?.url || ''}`;

    if (!error.response) {
      console.log(`[HTTP] Sem resposta do servidor para ${fullUrl} (${error.code || error.message})`);
    }

    // 401: Sessão expirada ou não autorizada
    if (status === 401) {
      console.log('[HTTP] Erro 401 - Sessão expirada ou não autorizada.');
      try {
        await StorageService.clearAuthSession();
      } catch {
        // ignore
      }
      if (onUnauthorizedCallback) {
        onUnauthorizedCallback();
      }
      return Promise.reject(new ApiError('UNAUTHORIZED', 'E-mail ou senha incorretos / Sessão expirada.', 401));
    }

    if (data?.erros && Array.isArray(data.erros) && data.erros.length > 0) {
      const msg = data.erros.map((e) => `${e.campo}: ${e.mensagem}`).join('\n');
      return Promise.reject(new ApiError(data.error ?? 'VALIDATION_ERROR', msg, status));
    }

    if (data?.mensagem) {
      return Promise.reject(new ApiError(data.error ?? 'API_ERROR', data.mensagem, status));
    }

    if (data?.message) {
      return Promise.reject(new ApiError(data.error ?? 'API_ERROR', data.message, status));
    }

    if (error.code === 'ECONNABORTED') {
      return Promise.reject(new ApiError('TIMEOUT', 'A requisição demorou demais.', status));
    }

    return Promise.reject(
      new ApiError('NETWORK_ERROR', 'Sem conexão com o servidor. Verifique a API.', status)
    );
  }
);
