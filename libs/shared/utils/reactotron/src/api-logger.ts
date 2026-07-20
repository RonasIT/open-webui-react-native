// Structural shape of a completed API call. Declared locally on purpose: this `type:utils`
// lib must not import from a `type:data-access` lib (Nx boundary). It stays assignable to
// `ApiLogger` from the nitro-api-client — the match is enforced where the two are wired together.
interface ApiCallLog {
  request: { method: string; params?: Record<string, any>; body?: unknown; headers: Record<string, string> };
  url: string;
  duration: number;
  response?: { status: number; headers: unknown; data: unknown };
  error?: { response?: { status: number; data?: unknown }; message: string };
}

// Minimal view of the Reactotron instance we need. Avoids leaking the full `ReactotronReactNative`
// type here and lets us pass parsed object bodies (Reactotron serializes them for display).
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

// Feeds nitro-api-client requests into Reactotron's network Timeline, reproducing the cards the
// XHR-based monitor showed before the nitro-fetch migration (nitro-fetch runs natively, bypassing
// the JS XMLHttpRequest that Reactotron's built-in monitor patches).
// Returns a no-op outside `__DEV__` or when reactotron-react-native is not installed.
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
