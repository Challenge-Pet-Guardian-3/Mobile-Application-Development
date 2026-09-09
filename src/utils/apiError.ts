import axios from 'axios';

interface ApiErrorPayload {
  erros?: Array<{ campo?: string; mensagem?: string }>;
  mensagem?: string;
  message?: string;
  error?: string;
  status?: number;
}

/**
 * Extrai de forma padronizada mensagens de erro detalhadas retornadas pela API Java (Spring Boot)
 * ou erros de rede/execução, evitando exibir mensagens genéricas hardcoded ao usuário.
 */
export function getApiErrorMessage(
  error: unknown,
  defaultMessage = 'Ocorreu um erro ao processar a requisição.'
): string {
  if (axios.isAxiosError(error)) {
    const data = error.response?.data as ApiErrorPayload | undefined;

    if (data) {
      // 1. Lista de erros formais de validação (Bean Validation / MethodArgumentNotValidException)
      if (Array.isArray(data.erros) && data.erros.length > 0) {
        return data.erros
          .map((e) => (e.campo ? `${e.campo}: ${e.mensagem ?? 'valor inválido'}` : (e.mensagem ?? 'Valor inválido')))
          .join('\n');
      }

      // 2. Mensagem específica tratada no GlobalExceptionHandler (ApiErrorResponse)
      const msg = data.mensagem || data.message;
      if (typeof msg === 'string' && msg.trim().length > 0) {
        return msg.trim();
      }
    }

    const status = error.response?.status;
    if (status === 401) {
      return 'Sessão expirada ou credenciais inválidas. Faça login novamente.';
    }
    if (status === 403) {
      return 'Você não possui permissão para realizar esta ação.';
    }
    if (status === 404) {
      return 'Recurso não encontrado no servidor.';
    }
    if (status && status >= 500) {
      return 'Servidor temporariamente indisponível. Tente novamente mais tarde.';
    }

    return error.message || defaultMessage;
  }

  if (error instanceof Error && error.message) {
    return error.message;
  }

  return defaultMessage;
}

/**
 * Extrai mensagens de erro específicas para fluxos de autenticação (Login / Registro).
 */
export function getAuthErrorMessage(
  error: unknown,
  defaultMessage = 'Falha na comunicação com o servidor.'
): string {
  if (axios.isAxiosError(error) && error.response?.status === 401) {
    return 'E-mail ou senha incorretos.';
  }
  return getApiErrorMessage(error, defaultMessage);
}
