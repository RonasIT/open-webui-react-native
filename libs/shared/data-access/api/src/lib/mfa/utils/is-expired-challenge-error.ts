import { isAxiosError } from 'axios';

const EXPIRED_CHALLENGE_PATTERN = /start again|sign in again|invalid authentication request/i;

export const isExpiredMfaChallengeError = (error: unknown): boolean => {
  const detail = isAxiosError<{ detail?: unknown }>(error) ? error.response?.data?.detail : undefined;

  return typeof detail === 'string' && EXPIRED_CHALLENGE_PATTERN.test(detail);
};
