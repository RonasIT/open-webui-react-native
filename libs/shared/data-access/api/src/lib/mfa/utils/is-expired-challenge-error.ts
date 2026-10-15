import { isAxiosError } from 'axios';

const expiredChallengePattern = /start again|sign in again|invalid authentication request/i;

export const isExpiredMfaChallengeError = (error: unknown): boolean => {
  const detail = isAxiosError<{ detail?: unknown }>(error) ? error.response?.data?.detail : undefined;

  return typeof detail === 'string' && expiredChallengePattern.test(detail);
};
