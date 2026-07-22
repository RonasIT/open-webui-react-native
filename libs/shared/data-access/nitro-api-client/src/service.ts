import { fetch as nitroFetch } from 'react-native-nitro-fetch';
import { ApiError } from './api-error';
import {
  ApiRequest,
  ApiResponse,
  ErrorInterceptor,
  HttpMethod,
  QueryParams,
  RequestInterceptor,
  RequestOptions,
  ResponseInterceptor,
} from './types';
import { ApiLogger } from './utils';

const joinUrl = (baseUrl: string, endpoint: string): string => {
  return `${baseUrl.replace(/\/+$/, '')}/${endpoint.replace(/^\/+/, '')}`;
};

const buildQueryString = (params?: QueryParams): string => {
  const pairs: Array<string> = [];

  for (const [key, value] of Object.entries(params ?? {})) {
    if (value === undefined || value === null) {
      continue;
    }

    if (Array.isArray(value)) {
      for (const item of value) {
        pairs.push(`${encodeURIComponent(`${key}[]`)}=${encodeURIComponent(String(item))}`);
      }
    } else {
      pairs.push(`${encodeURIComponent(key)}=${encodeURIComponent(String(value))}`);
    }
  }

  return pairs.length > 0 ? `?${pairs.join('&')}` : '';
};

const parseResponseBody = async (response: Response): Promise<unknown> => {
  const text = await response.text();

  if (!text) {
    return undefined;
  }

  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
};

export class NitroApiService {
  private readonly requestInterceptors: Array<RequestInterceptor> = [];
  private readonly responseInterceptors: Array<ResponseInterceptor> = [];
  private readonly errorInterceptors: Array<ErrorInterceptor> = [];

  constructor(
    private readonly baseUrl: string,
    private readonly logger?: ApiLogger,
  ) {}

  public useInterceptors(interceptors: {
    request?: Array<RequestInterceptor>;
    response?: Array<ResponseInterceptor>;
    error?: Array<ErrorInterceptor>;
  }): void {
    this.requestInterceptors.push(...(interceptors.request ?? []));
    this.responseInterceptors.push(...(interceptors.response ?? []));
    this.errorInterceptors.push(...(interceptors.error ?? []));
  }

  public get<T = any>(endpoint: string, params?: QueryParams, options?: RequestOptions): Promise<T> {
    return this.request('GET', endpoint, params, undefined, options);
  }

  public delete<T = any>(endpoint: string, params?: QueryParams, options?: RequestOptions): Promise<T> {
    return this.request('DELETE', endpoint, params, undefined, options);
  }

  public post<T = any>(endpoint: string, body?: unknown, options?: RequestOptions): Promise<T> {
    return this.request('POST', endpoint, undefined, body, options);
  }

  public put<T = any>(endpoint: string, body?: unknown, options?: RequestOptions): Promise<T> {
    return this.request('PUT', endpoint, undefined, body, options);
  }

  public patch<T = any>(endpoint: string, body?: unknown, options?: RequestOptions): Promise<T> {
    return this.request('PATCH', endpoint, undefined, body, options);
  }

  private async request<T>(
    method: HttpMethod,
    endpoint: string,
    params?: QueryParams,
    body?: unknown,
    options?: RequestOptions,
  ): Promise<T> {
    let request: ApiRequest = { method, endpoint, params, body, headers: { ...options?.headers } };

    for (const interceptor of this.requestInterceptors) {
      request = await interceptor(request);
    }

    const url = joinUrl(this.baseUrl, request.endpoint) + buildQueryString(request.params);
    const startedAt = Date.now();

    let response: Response;

    try {
      response = await nitroFetch(url, {
        method: request.method,
        headers: request.headers,
        body: this.prepareBody(request),
        credentials: 'include',
      });
    } catch (cause) {
      const message = cause instanceof Error ? cause.message : 'Network error';
      const error = new ApiError(message, request);
      this.logger?.({ request, url, duration: Date.now() - startedAt, error });

      throw await this.processError(error);
    }

    const data = await parseResponseBody(response);

    if (!response.ok) {
      const error = new ApiError(`Request failed with status code ${response.status}`, request, {
        status: response.status,
        data,
      });
      this.logger?.({ request, url, duration: Date.now() - startedAt, error });

      throw await this.processError(error);
    }

    let apiResponse: ApiResponse = { status: response.status, headers: response.headers, data, request };
    this.logger?.({ request, url, duration: Date.now() - startedAt, response: apiResponse });

    for (const interceptor of this.responseInterceptors) {
      apiResponse = await interceptor(apiResponse);
    }

    return apiResponse.data as T;
  }

  private prepareBody(request: ApiRequest): string | FormData | undefined {
    if (request.body === undefined) {
      return undefined;
    }

    if (request.body instanceof FormData) {
      return request.body;
    }

    request.headers['Content-Type'] = 'application/json';

    return JSON.stringify(request.body);
  }

  private async processError(error: ApiError): Promise<ApiError> {
    for (const interceptor of this.errorInterceptors) {
      await interceptor(error);
    }

    return error;
  }
}
