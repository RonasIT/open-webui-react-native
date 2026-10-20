import { HttpStatusCode, isAxiosError } from 'axios';

const expiredChallengePattern = /start again|sign in again|invalid authentication request/i;

const expiredChallengeStatuses = new Set<number>([
  HttpStatusCode.Unauthorized,
  HttpStatusCode.Forbidden,
  HttpStatusCode.Conflict,
  HttpStatusCode.TooManyRequests,
]);

export const isExpiredMfaChallengeError = (error: unknown): boolean => {
  if (!isAxiosError<{ detail?: unknown }>(error) || !error.response) {
    return false;
  }

  const { status, data } = error.response;

  return (
    expiredChallengeStatuses.has(status) &&
    typeof data?.detail === 'string' &&
    expiredChallengePattern.test(data.detail)
  );
};
