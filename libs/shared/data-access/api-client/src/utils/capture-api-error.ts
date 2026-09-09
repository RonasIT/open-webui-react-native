import * as Sentry from '@sentry/react-native';
import { AxiosError, isAxiosError } from 'axios';
import { ApiErrorData } from '../types';

const MAX_STRING_LENGTH = 500;
const MAX_ARRAY_ITEMS = 20;

const truncateValue = (value: unknown, depth = 0): unknown => {
  if (depth > 4) {
    return '[truncated]';
  }

  if (typeof value === 'string') {
    return value.length > MAX_STRING_LENGTH
      ? `${value.slice(0, MAX_STRING_LENGTH)}…(${value.length} chars)`
      : value;
  }

  if (Array.isArray(value)) {
    const items = value.slice(0, MAX_ARRAY_ITEMS).map((item) => truncateValue(item, depth + 1));

    if (value.length > MAX_ARRAY_ITEMS) {
      items.push(`…(${value.length - MAX_ARRAY_ITEMS} more items)`);
    }

    return items;
  }

  if (value && typeof value === 'object') {
    return Object.fromEntries(
      Object.entries(value).map(([key, nestedValue]) => [key, truncateValue(nestedValue, depth + 1)]),
    );
  }

  return value;
};

const parseRequestBody = (data: unknown): unknown => {
  if (typeof data !== 'string') {
    return data;
  }

  try {
    return JSON.parse(data);
  } catch {
    return data;
  }
};

const getRequestUrl = (error: AxiosError): string | undefined => {
  const { baseURL, url } = error.config ?? {};

  if (!url) {
    return baseURL;
  }

  if (url.startsWith('http')) {
    return url;
  }

  return `${baseURL ?? ''}${url}`;
};

export type CaptureApiErrorParams = {
  operation: string;
  context?: Record<string, unknown>;
};

export const captureApiError = (error: unknown, { operation, context = {} }: CaptureApiErrorParams): void => {
  if (isAxiosError(error)) {
    const axiosError = error as AxiosError<ApiErrorData>;
    const { config, response } = axiosError;
    const status = response?.status;

    Sentry.withScope((scope) => {
      scope.setTag('api.operation', operation);
      scope.setTag('http.status_code', String(status ?? 'unknown'));
      scope.setTag('http.method', config?.method ?? 'unknown');
      scope.setLevel('error');

      scope.setContext('api', {
        url: getRequestUrl(axiosError),
        method: config?.method,
        status,
        statusText: response?.statusText,
        responseData: truncateValue(response?.data),
        requestParams: truncateValue(config?.params),
        requestBody: truncateValue(parseRequestBody(config?.data)),
      });

      scope.setContext('api_request', truncateValue(context));

      scope.setFingerprint(['api-error', operation, String(status ?? 'unknown')]);

      Sentry.captureException(error);
    });

    return;
  }

  Sentry.withScope((scope) => {
    scope.setTag('api.operation', operation);
    scope.setContext('api_request', truncateValue(context));
    Sentry.captureException(error);
  });
};
