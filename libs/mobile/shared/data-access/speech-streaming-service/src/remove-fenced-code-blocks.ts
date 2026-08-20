export interface RemoveFencedCodeBlocksOptions {
  holdIncomplete?: boolean;
}

/**
 * Removes fenced markdown code blocks (``` / ~~~) from text for TTS.
 * When holdIncomplete is true, truncates from an unclosed opening fence
 * so streaming code is not spoken before the fence closes.
 */
export const removeFencedCodeBlocks = (
  text: string,
  { holdIncomplete = false }: RemoveFencedCodeBlocksOptions = {},
): string => {
  let result = '';
  let index = 0;

  while (index < text.length) {
    const atLineStart = index === 0 || text[index - 1] === '\n';

    if (atLineStart) {
      const fenceMatch = matchOpeningFence(text, index);

      if (fenceMatch) {
        const closingEnd = findClosingFence(text, fenceMatch);

        if (closingEnd !== null) {
          result += result.length > 0 && !/\s$/.test(result) ? ' ' : '';
          index = closingEnd;

          continue;
        }

        if (holdIncomplete) {
          return result;
        }

        return result.length > 0 && !/\s$/.test(result) ? `${result} ` : result;
      }
    }

    result += text[index];
    index += 1;
  }

  return result;
};

interface OpeningFenceMatch {
  start: number;
  fenceChar: '`' | '~';
  fenceLength: number;
  contentStart: number;
}

const matchOpeningFence = (text: string, start: number): OpeningFenceMatch | null => {
  let index = start;
  let spaces = 0;

  while (spaces < 3 && text[index] === ' ') {
    spaces += 1;
    index += 1;
  }

  const fenceChar = text[index];

  if (fenceChar !== '`' && fenceChar !== '~') {
    return null;
  }

  let fenceLength = 0;

  while (text[index + fenceLength] === fenceChar) {
    fenceLength += 1;
  }

  if (fenceLength < 3) {
    return null;
  }

  const infoStart = index + fenceLength;
  const lineEnd = text.indexOf('\n', infoStart);

  // Incomplete opening fence line — treat as an open fence
  if (lineEnd === -1) {
    return {
      start,
      fenceChar,
      fenceLength,
      contentStart: text.length,
    };
  }

  return {
    start,
    fenceChar,
    fenceLength,
    contentStart: lineEnd + 1,
  };
};

const findClosingFence = (text: string, opening: OpeningFenceMatch): number | null => {
  if (opening.contentStart >= text.length) {
    return null;
  }

  let lineStart = opening.contentStart;

  while (lineStart <= text.length) {
    let index = lineStart;
    let spaces = 0;

    while (spaces < 3 && text[index] === ' ') {
      spaces += 1;
      index += 1;
    }

    if (text[index] === opening.fenceChar) {
      let closeLength = 0;

      while (text[index + closeLength] === opening.fenceChar) {
        closeLength += 1;
      }

      if (closeLength >= opening.fenceLength) {
        const afterFence = index + closeLength;
        const nextNewline = text.indexOf('\n', afterFence);
        const restOfLine = nextNewline === -1 ? text.slice(afterFence) : text.slice(afterFence, nextNewline);

        if (/^\s*$/.test(restOfLine)) {
          return nextNewline === -1 ? text.length : nextNewline + 1;
        }
      }
    }

    const nextNewline = text.indexOf('\n', lineStart);

    if (nextNewline === -1) {
      return null;
    }

    lineStart = nextNewline + 1;
  }

  return null;
};
