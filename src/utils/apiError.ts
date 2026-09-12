import { Alert } from 'react-native';
import axios, { AxiosError } from 'axios';
import { ApiError, ApiErrorResponse } from '../types/api';

export interface ActionCallbacks {
  onSuccess?: () => void;
  onError?: (error: unknown) => void;
}

/**
 * Normaliza qualquer erro (AxiosError, ApiError, Error nativo ou desconhecido)
 * em uma instância canônica de ApiError com código semântico, status HTTP e mensagem amigável.
 * Princípio SRP: Fonte única de verdade para normalização de falhas da API / Nuvem (Railway).
 */
export function normalizeHttpError(error: unknown): ApiError {
  if (error instanceof ApiError) {
    return error;
  }

  if (axios.isAxiosError(error)) {
    const axiosError = error as AxiosError<ApiErrorResponse>;
    const status = axiosError.response?.status ?? 0;
    const data = axiosError.response?.data;

    // 1. Mensagens detalhadas de validação (Spring Boot Bean Validation)
    if (data?.erros && Array.isArray(data.erros) && data.erros.length > 0) {
      const validationMessage = data.erros
        .map((e) => (e.campo ? `${e.campo}: ${e.mensagem ?? 'valor inválido'}` : (e.mensagem ?? 'Valor inválido')))
        .join('\n');
      return new ApiError(data.error ?? 'VALIDATION_ERROR', validationMessage, status);
    }

    // 2. Mensagem explícita enviada pelo backend (GlobalExceptionHandler)
    const customMessage = data?.mensagem || data?.message;
    if (typeof customMessage === 'string' && customMessage.trim().length > 0) {
      return new ApiError(data?.error ?? 'API_ERROR', customMessage.trim(), status);
    }

    // 3. Status HTTP canônicos
    if (status === 401) {
      return new ApiError('UNAUTHORIZED', 'Sessão expirada ou credenciais inválidas. Faça login novamente.', 401);
    }

    if (status === 403) {
      return new ApiError('FORBIDDEN', 'Você não possui permissão para realizar esta ação.', 403);
    }

    if (status === 404) {
      return new ApiError('NOT_FOUND', 'Recurso não encontrado no servidor.', 404);
    }

    // 4. Cold start ou indisponibilidade de proxy reverso (Railway)
    if (status === 502 || status === 503 || status === 504) {
      return new ApiError(
        'SERVER_STARTING',
        'O servidor em nuvem (Railway) está inicializando. Por favor, aguarde alguns instantes e tente novamente.',
        status
      );
    }

    if (status >= 500) {
      return new ApiError(
        'INTERNAL_SERVER_ERROR',
        'Servidor temporariamente indisponível. Tente novamente mais tarde.',
        status
      );
    }

    // 5. Timeouts e falhas de rede
    if (axiosError.code === 'ECONNABORTED' || axiosError.code === 'ETIMEDOUT') {
      return new ApiError(
        'TIMEOUT',
        'O servidor demorou para responder. Isso pode ocorrer durante o início da aplicação em nuvem. Tente novamente em instantes.',
        status || 408
      );
    }

    if (!axiosError.response || axiosError.code === 'ERR_NETWORK') {
      return new ApiError(
        'NETWORK_ERROR',
        'Sem conexão com o servidor. Verifique sua conexão com a internet.',
        0
      );
    }

    return new ApiError(
      axiosError.code ?? 'HTTP_ERROR',
      axiosError.message || 'Ocorreu um erro ao processar a requisição.',
      status
    );
  }

  if (error instanceof Error && error.message) {
    return new ApiError('UNKNOWN_ERROR', error.message, 0);
  }

  return new ApiError('UNKNOWN_ERROR', 'Ocorreu um erro ao processar a requisição.', 0);
}

/**
 * Extrai de forma padronizada mensagens de erro detalhadas retornadas pela API Java (Spring Boot)
 * ou erros de rede/execução/nuvem (Railway), evitando exibir mensagens genéricas hardcoded ao usuário.
 */
export function getApiErrorMessage(
  error: unknown,
  defaultMessage = 'Ocorreu um erro ao processar a requisição.'
): string {
  const normalized = normalizeHttpError(error);
  return normalized.message.trim() || defaultMessage;
}

/**
 * Extrai mensagens de erro específicas para fluxos de autenticação (Login / Registro).
 */
export function getAuthErrorMessage(
  error: unknown,
  defaultMessage = 'Falha na comunicação com o servidor.'
): string {
  const normalized = normalizeHttpError(error);
  if (normalized.status === 401) {
    return 'E-mail ou senha incorretos.';
  }

  return normalized.message.trim() || defaultMessage;
}

/**
 * Cria callbacks padronizados de sucesso e tratamento de erro com Alert nativo para mutações do TanStack Query.
 */
export function createMutationCallbacks(
  errorTitle: string,
  defaultErrorMsg: string,
  callbacks?: ActionCallbacks
) {
  return {
    onSuccess: () => callbacks?.onSuccess?.(),
    onError: (err: unknown) => {
      Alert.alert(errorTitle, getApiErrorMessage(err, defaultErrorMsg));
      callbacks?.onError?.(err);
    },
  };
}
