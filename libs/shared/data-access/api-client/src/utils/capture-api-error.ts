import * as Sentry from '@sentry/react-native';
import { AxiosError, isAxiosError } from 'axios';
import { queryClient } from '@open-webui-react-native/shared/data-access/query-client';
import { getApiUrl } from '@open-webui-react-native/shared/utils/config';
import { ApiErrorData } from '../types';

const MAX_STRING_LENGTH = 500;
const MAX_ARRAY_ITEMS = 20;
const REDACTED_TEXT_KEYS = new Set(['content', 'message', 'text', 'prompt']);

const redactText = (value: string): string => `[redacted:${value.length} chars]`;

const redactSensitiveData = (value: unknown, key?: string, depth = 0): unknown => {
  if (depth > 6) {
    return '[truncated]';
  }

  if (key && REDACTED_TEXT_KEYS.has(key) && typeof value === 'string') {
    return redactText(value);
  }

  if (Array.isArray(value)) {
    return value.map((item) => redactSensitiveData(item, undefined, depth + 1));
  }

  if (value && typeof value === 'object') {
    return Object.fromEntries(
      Object.entries(value).map(([nestedKey, nestedValue]) => [
        nestedKey,
        redactSensitiveData(nestedValue, nestedKey, depth + 1),
      ]),
    );
  }

  return value;
};

const truncateValue = (value: unknown, depth = 0): unknown => {
  if (depth > 4) {
    return '[truncated]';
  }

  if (typeof value === 'string') {
    return value.length > MAX_STRING_LENGTH ? `${value.slice(0, MAX_STRING_LENGTH)}…(${value.length} chars)` : value;
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

const sanitizeForSentry = (value: unknown): unknown => truncateValue(redactSensitiveData(value));

const sanitizeContextForSentry = (context: Record<string, unknown>): Record<string, unknown> =>
  sanitizeForSentry(context) as Record<string, unknown>;

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

const getApiInstanceMeta = (): { apiUrl: string; apiVersion?: string } => {
  const configuration = queryClient.getQueryData<{ version?: string }>(['config']);

  return {
    apiUrl: getApiUrl(),
    apiVersion: configuration?.version,
  };
};

export type CaptureApiErrorParams = {
  operation: string;
  context?: Record<string, unknown>;
};

export const captureApiError = (error: unknown, { operation, context = {} }: CaptureApiErrorParams): void => {
  const { apiUrl, apiVersion } = getApiInstanceMeta();

  if (isAxiosError(error)) {
    const axiosError = error as AxiosError<ApiErrorData>;
    const { config, response } = axiosError;
    const status = response?.status;

    Sentry.withScope((scope) => {
      scope.setTag('api.operation', operation);
      scope.setTag('http.status_code', String(status ?? 'unknown'));
      scope.setTag('http.method', config?.method ?? 'unknown');
      scope.setTag('api.version', apiVersion ?? 'unknown');
      scope.setLevel('error');

      scope.setContext('api', {
        apiUrl,
        apiVersion,
        url: getRequestUrl(axiosError),
        method: config?.method,
        status,
        statusText: response?.statusText,
        responseData: sanitizeForSentry(response?.data),
        requestParams: sanitizeForSentry(config?.params),
        requestBody: sanitizeForSentry(parseRequestBody(config?.data)),
      });

      scope.setContext('api_request', sanitizeContextForSentry(context));

      scope.setFingerprint(['api-error', operation, String(status ?? 'unknown')]);

      Sentry.captureException(error);
    });

    return;
  }

  Sentry.withScope((scope) => {
    scope.setTag('api.operation', operation);
    scope.setTag('api.version', apiVersion ?? 'unknown');
    scope.setContext('api', { apiUrl, apiVersion });
    scope.setContext('api_request', sanitizeContextForSentry(context));
    Sentry.captureException(error);
  });
};
