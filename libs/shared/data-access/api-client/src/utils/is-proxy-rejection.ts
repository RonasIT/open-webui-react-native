import { AxiosError, HttpStatusCode, isAxiosError } from 'axios';

// NOTE: Open WebUI answers 403 with a JSON `detail`. A proxy in front of it answers with an HTML page or an empty body.
export const isProxyRejection = (error: unknown): boolean => {
  if (!isAxiosError(error) || error.response?.status !== HttpStatusCode.Forbidden) {
    return false;
  }

  const data = (error as AxiosError).response?.data;

  return !(typeof data === 'object' && data !== null && 'detail' in data);
};
