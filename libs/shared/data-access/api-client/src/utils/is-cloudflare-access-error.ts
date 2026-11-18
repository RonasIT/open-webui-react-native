import { AxiosHeaders, HttpStatusCode, isAxiosError } from 'axios';

export const isCloudflareAccessError = (error: unknown): boolean => {
  if (!isAxiosError(error) || error.response?.status !== HttpStatusCode.Unauthorized) {
    return false;
  }

  const authenticate = AxiosHeaders.from(error.response.headers as AxiosHeaders).get('www-authenticate');

  return typeof authenticate === 'string' && authenticate.startsWith('Cloudflare-Access');
};
