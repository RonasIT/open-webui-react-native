import { removeFencedCodeBlocks } from './remove-fenced-code-blocks';

export interface PrepareSpeakableTextOptions {
  holdIncomplete?: boolean;
}

/**
 * Prepares streaming markdown for TTS: drops code fences, details/tool blocks,
 * math, citations and markdown syntax while keeping readable prose.
 */
export const prepareSpeakableText = (
  text: string,
  { holdIncomplete = false }: PrepareSpeakableTextOptions = {},
): string => {
  let result = removeFencedCodeBlocks(text, { holdIncomplete });
  result = removeDetailsBlocks(result, { holdIncomplete });
  result = stripMarkdownForSpeech(result);
  result = normalizeSpeakableWhitespace(result);

  return result;
};

const removeDetailsBlocks = (text: string, { holdIncomplete = false }: PrepareSpeakableTextOptions): string => {
  let result = '';
  let index = 0;

  while (index < text.length) {
    const openMatch = text.slice(index).match(/<\s*details\b/i);

    if (!openMatch || openMatch.index === undefined) {
      result += text.slice(index);
      break;
    }

    const openStart = index + openMatch.index;
    result += text.slice(index, openStart);

    const fromOpen = text.slice(openStart);
    const openEndOffset = indexAfterOpenTag(fromOpen);

    if (openEndOffset === -1) {
      return holdIncomplete ? result : appendBoundarySpace(result);
    }

    const closeMatch = fromOpen.slice(openEndOffset).match(/<\s*\/\s*details\s*>/i);

    if (!closeMatch || closeMatch.index === undefined) {
      return holdIncomplete ? result : appendBoundarySpace(result);
    }

    index = openStart + openEndOffset + closeMatch.index + closeMatch[0].length;
    result = appendBoundarySpace(result);
  }

  return result;
};

const indexAfterOpenTag = (text: string): number => {
  let index = 0;
  let inDouble = false;
  let escape = false;

  while (index < text.length) {
    const char = text[index];

    if (escape) {
      escape = false;
      index += 1;
      continue;
    }

    if (char === '\\') {
      escape = true;
      index += 1;
      continue;
    }

    if (char === '"') {
      inDouble = !inDouble;
      index += 1;
      continue;
    }

    if (char === '>' && !inDouble) {
      return index + 1;
    }

    index += 1;
  }

  return -1;
};

const stripMarkdownForSpeech = (text: string): string => {
  let result = text;

  // NOTE: Display math first so inline $ patterns do not match block delimiters
  result = result.replace(/\$\$[\s\S]*?\$\$/g, ' ');
  result = result.replace(/\$([^$\n]+)\$/g, ' ');

  // NOTE: Inline code (fenced blocks already removed)
  result = result.replace(/`[^`\n]+`/g, ' ');

  // NOTE: Images and links — keep visible label only
  result = result.replace(/!\[([^\]]*)\]\([^)]*\)/g, '$1');
  result = result.replace(/\[([^\]]+)\]\([^)]*\)/g, '$1');

  // NOTE: Bold / italic / strike — skip single '_' to preserve snake_case
  result = result.replace(/\*\*(.+?)\*\*/g, '$1');
  result = result.replace(/__(.+?)__/g, '$1');
  result = result.replace(/\*(.+?)\*/g, '$1');
  result = result.replace(/~~(.+?)~~/g, '$1');

  // NOTE: ATX headings and list markers at line start
  result = result.replace(/^#{1,6}\s+/gm, '');
  result = result.replace(/^\s*([-*+]|\d+\.)\s+/gm, '');

  // NOTE: Citation markers like [1], [12]
  result = result.replace(/\[(\d+)\]/g, ' ');

  // NOTE: Horizontal rules
  result = result.replace(/^\s{0,3}([-*_])(?:\s*\1){2,}\s*$/gm, ' ');

  // NOTE: Blockquote markers
  result = result.replace(/^\s{0,3}>\s?/gm, '');

  return result;
};

// NOTE: Avoid trim() so streaming speakable prefixes stay stable for the spoken cursor
const normalizeSpeakableWhitespace = (text: string): string =>
  text
    .replace(/[^\S\n]+/g, ' ')
    .replace(/\n{3,}/g, '\n\n')
    .replace(/ ?\n ?/g, '\n');

const appendBoundarySpace = (text: string): string => (text.length > 0 && !/\s$/.test(text) ? `${text} ` : text);
