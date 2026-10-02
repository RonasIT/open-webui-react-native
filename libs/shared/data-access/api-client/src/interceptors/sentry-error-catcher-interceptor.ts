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

const getSkipSentryReport = (error: unknown): boolean => {
  return isAxiosError(error) && Boolean((error as AxiosError).config?.params?.skipSentryReport);
};

export const sentryErrorCatcherInterceptor =
  () =>
  (error: unknown): Promise<never> => {
    if (!getSkipSentryReport(error)) {
      captureApiError(error, { operation: getOperation(error) });
    }

    return Promise.reject(error);
  };
