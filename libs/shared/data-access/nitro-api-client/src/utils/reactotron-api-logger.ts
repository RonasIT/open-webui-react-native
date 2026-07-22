import { ApiCallLog } from './api-logger';

interface ReactotronApiResponse {
  apiResponse(
    request: { url: string; method: string; data: unknown; params: unknown; headers: Record<string, string> },
    response: { status: number; body: unknown; headers: Record<string, string> },
    duration: number,
  ): void;
}

const toHeaderRecord = (headers: unknown): Record<string, string> => {
  if (!headers || typeof headers !== 'object') {
    return {};
  }

  // A fetch `Headers` instance is not a plain object — flatten it via `forEach` when present.
  const iterable = headers as { forEach?: (callback: (value: string, key: string) => void) => void };

  if (typeof iterable.forEach === 'function') {
    const record: Record<string, string> = {};
    iterable.forEach((value, key) => {
      record[key] = value;
    });

    return record;
  }

  return headers as Record<string, string>;
};

export const createReactotronApiLogger = (): ((log: ApiCallLog) => void) => {
  if (!__DEV__) {
    return () => undefined;
  }

  let tron: ReactotronApiResponse | undefined;

  try {
    tron = require('reactotron-react-native').default;
  } catch {
    return () => undefined;
  }

  return ({ request, url, duration, response, error }) => {
    tron?.apiResponse(
      {
        url,
        method: request.method,
        data: request.body,
        params: request.params,
        headers: request.headers,
      },
      {
        status: response?.status ?? error?.response?.status ?? 0,
        body: response?.data ?? error?.response?.data ?? error?.message,
        headers: toHeaderRecord(response?.headers),
      },
      duration,
    );
  };
};
