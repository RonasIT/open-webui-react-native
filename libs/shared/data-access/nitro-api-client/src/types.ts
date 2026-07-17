import { ApiError } from './api-error';

export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

export type QueryParams = Record<string, any>;

export type RequestOptions = {
  headers?: Record<string, string>;
  // Accepted for call-site compatibility with the axios client. Cookies are always sent.
  withCredentials?: boolean;
};

// A request being prepared: interceptors receive it and may modify headers, params, etc.
export type ApiRequest = {
  method: HttpMethod;
  endpoint: string;
  headers: Record<string, string>;
  params?: QueryParams;
  body?: unknown;
};

// A successful response: interceptors receive it and may transform `data` before it is returned to the caller.
export type ApiResponse<TData = unknown> = {
  status: number;
  headers: Headers;
  data: TData;
  request: ApiRequest;
};

export type RequestInterceptor = (request: ApiRequest) => ApiRequest | Promise<ApiRequest>;

export type ResponseInterceptor = (response: ApiResponse) => ApiResponse | Promise<ApiResponse>;

// Called for every failed request (error responses and network errors) before the error is thrown.
export type ErrorInterceptor = (error: ApiError) => void | Promise<void>;
