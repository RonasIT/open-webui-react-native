import { isEmpty } from 'lodash-es';

export const parseObjectToString = (parsed: string): string | undefined => {
  if (typeof parsed === 'object' && parsed !== null && isEmpty(parsed)) {
    return undefined;
  }

  if (typeof parsed === 'object' && parsed !== null && !Array.isArray(parsed)) {
    return Object.entries(parsed)
      .map(
        ([key, value]) =>
          `${key}\n${typeof value === 'object' && value !== null ? JSON.stringify(value) : String(value)}`,
      )
      .join('\n\n');
  }

  if (typeof parsed === 'object' && parsed !== null) {
    return JSON.stringify(parsed, null, 2);
  }

  return String(parsed);
};
