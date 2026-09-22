import { isEmpty } from 'lodash-es';

export const parseObjectToString = (parsed: unknown): string | undefined => {
  if (typeof parsed !== 'object' || parsed === null) {
    return String(parsed);
  }

  if (isEmpty(parsed)) {
    return undefined;
  }

  if (Array.isArray(parsed)) {
    return JSON.stringify(parsed, null, 2);
  }

  return Object.entries(parsed)
    .map(
      ([key, value]) =>
        `${key}\n${typeof value === 'object' && value !== null ? JSON.stringify(value) : String(value)}`,
    )
    .join('\n\n');
};
