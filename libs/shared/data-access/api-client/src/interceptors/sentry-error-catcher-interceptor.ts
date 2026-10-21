import { AxiosError, HttpStatusCode, isAxiosError } from 'axios';
import { captureApiError } from '../utils/capture-api-error';

// Only statuses that signal a broken API contract: no-response errors, 401 and proxy 5xx are noise that
// drains the Sentry quota and buries real breakages in the "API error spike" alert.
const reportableStatuses = new Set<number>([
  HttpStatusCode.BadRequest,
  HttpStatusCode.Forbidden,
  HttpStatusCode.NotFound,
  HttpStatusCode.MethodNotAllowed,
  HttpStatusCode.Conflict,
  HttpStatusCode.UnprocessableEntity,
  HttpStatusCode.InternalServerError,
]);

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

const getIsReportableError = (error: unknown): boolean => {
  if (!isAxiosError(error)) {
    return true;
  }

  const status = (error as AxiosError).response?.status;

  return status !== undefined && reportableStatuses.has(status);
};

export const sentryErrorCatcherInterceptor =
  () =>
  (error: unknown): Promise<never> => {
    if (!getSkipSentryReport(error) && getIsReportableError(error)) {
      captureApiError(error, { operation: getOperation(error) });
    }

    return Promise.reject(error);
  };
