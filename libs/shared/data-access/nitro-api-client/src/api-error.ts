import type { ApiRequest } from './types';

// Shaped like AxiosError: consumers can keep reading `error.message` and `error.response?.status/data`.
// `response` is undefined for network errors (no answer from the server).
export class ApiError<TData = unknown> extends Error {
  public readonly request: ApiRequest;
  public readonly response?: {
    status: number;
    data?: TData;
  };

  constructor(message: string, request: ApiRequest, response?: { status: number; data?: TData }) {
    super(message);
    this.name = 'ApiError';
    this.request = request;
    this.response = response;
  }
}
