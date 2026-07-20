import { ApiError } from '../api-error';
import { ApiRequest, ApiResponse } from '../types';

// A completed API call handed to an optional logger. The client stays logger-agnostic:
// it knows this abstract shape, not any concrete tool (e.g. Reactotron). Adapters live
// in the project that has the tool installed and are wired via `NitroApiService`'s constructor.
export interface ApiCallLog {
  request: ApiRequest;
  url: string;
  duration: number;
  response?: ApiResponse;
  error?: ApiError;
}

export type ApiLogger = (log: ApiCallLog) => void;
