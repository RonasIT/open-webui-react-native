import { AxiosRequestConfig } from 'axios';

// NOTE: A request of the background chat sync: a failure shows no toast and is not reported to Sentry,
// and the timeout keeps a hung request from blocking every later sync.
export interface BackgroundRequestOptions {
  timeout: number;
}

export const getBackgroundRequestConfig = (
  background?: BackgroundRequestOptions,
): { params?: Record<string, boolean>; options?: AxiosRequestConfig } =>
  background ? { params: { skipToast: true, skipSentryReport: true }, options: { timeout: background.timeout } } : {};
