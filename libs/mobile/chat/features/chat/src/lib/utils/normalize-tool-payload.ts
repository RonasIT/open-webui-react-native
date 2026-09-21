import { decode } from 'html-entities';
import { parseObjectToString } from '@open-webui-react-native/shared/utils/strings';

export type PayloadContentType = 'json' | 'text';

export interface NormalizedToolOutput {
  output: string;
  outputContentType: PayloadContentType;
}

// Tools routinely answer with JSON that has been stringified more than once on its way here, so
// unwrap until a non-string falls out rather than showing the user a wall of escaped quotes.
const parseJsonRecursive = (value: string): unknown => {
  let current: unknown = value.trim();

  for (let depth = 0; depth < 32; depth++) {
    if (typeof current !== 'string') {
      return current;
    }

    try {
      current = JSON.parse(current);
    } catch {
      return current;
    }
  }

  return current;
};

export const normalizeToolOutput = (raw: string): NormalizedToolOutput => {
  const parsed = parseJsonRecursive(decode(raw));

  if (typeof parsed === 'object' && parsed !== null) {
    return { output: JSON.stringify(parsed, null, 2), outputContentType: 'json' };
  }

  return { output: String(parsed), outputContentType: 'text' };
};

export const normalizeToolInput = (raw?: string): string | undefined =>
  raw ? parseObjectToString(parseJsonRecursive(decode(raw))) : undefined;
