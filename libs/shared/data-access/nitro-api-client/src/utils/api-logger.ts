import { ApiError } from '../api-error';
import { ApiRequest, ApiResponse } from '../types';

export interface ApiCallLog {
  request: ApiRequest;
  url: string;
  duration: number;
  response?: ApiResponse;
  error?: ApiError;
}

export type ApiLogger = (log: ApiCallLog) => void;
