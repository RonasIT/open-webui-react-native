import { AxiosError, isAxiosError } from 'axios';
import { captureApiError } from '../utils/capture-api-error';

const getOperation = (error: unknown): string => {
  if (isAxiosError(error)) {
    const axiosError = error as AxiosError;
    const method = axiosError.config?.method?.toUpperCase() ?? 'UNKNOWN';
    const url = axiosError.config?.url ?? 'unknown';

    return `${method} ${url}`;
  }

  return error instanceof Error ? error.message : 'unknown';
};

export const sentryErrorCatcherInterceptor =
  () =>
  (error: unknown): Promise<never> => {
    captureApiError(error, { operation: getOperation(error) });

    return Promise.reject(error);
  };
