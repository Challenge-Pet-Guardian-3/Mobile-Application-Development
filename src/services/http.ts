import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import { StorageService } from './storage';
import { env } from '../config/env';
import { ApiErrorResponse } from '../types/api';
import { normalizeHttpError } from '../utils/apiError';

// Instância centralizada do Axios configurada para ambientes em nuvem (Railway / Render)
export const http = axios.create({
  baseURL: env.apiUrl,
  timeout: 40000, // 40 segundos para tolerar cold starts do container e pool de banco
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

// Interceptor de Response: Orquestra limpeza de sessão em 401 e delega normalização a normalizeHttpError (SRP)
http.interceptors.response.use(
  (response) => response,
  async (error: AxiosError<ApiErrorResponse>) => {
    const status = error.response?.status ?? 0;

    // 401: Notificação e limpeza de credenciais
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
    }

    return Promise.reject(normalizeHttpError(error));
  }
);

let inFlightWarmup: Promise<boolean> | null = null;
let lastWarmupTimestamp = 0;
const WARMUP_COOLDOWN_MS = 10 * 60 * 1000; // 10 minutos de intervalo mínimo

export const HttpService = {
  /**
   * Dispara um ping assíncrono para o endpoint de saúde do Spring Boot (/actuator/health)
   * para acordar preventivamente o container do Railway e aquecer o pool de conexões.
   * Possui deduplicação estrita de promessa em voo e cooldown de 10 minutos para evitar requisições redundantes.
   */
  async warmup(): Promise<boolean> {
    const now = Date.now();

    // Se já foi aquecido na janela de cooldown, não repete a requisição
    if (now - lastWarmupTimestamp < WARMUP_COOLDOWN_MS) {
      return true;
    }

    // Se já existe uma requisição de warmup em andamento, reaproveita a mesma promessa
    if (inFlightWarmup) {
      return inFlightWarmup;
    }

    inFlightWarmup = (async () => {
      try {
        await http.get('/actuator/health', {
          timeout: 20000,
          headers: { 'X-Warmup-Ping': 'true' },
        });
        lastWarmupTimestamp = Date.now();
        return true;
      } catch {
        return false;
      } finally {
        inFlightWarmup = null;
      }
    })();

    return inFlightWarmup;
  },
};
