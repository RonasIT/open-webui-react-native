const fencePattern = /^[ \t]*(?:>[ \t]*)*(`{3,}|~{3,})(.*)$/;
const linePrefixPattern = /^[ \t>]*/gm;

/**
 * Returns the body of the fenced code block that is still open at the end of the markdown
 * (i.e. is being streamed), or `null` when every fence is closed.
 */
export const getOpenFenceBody = (markdown: string): string | null => {
  const lines = markdown.split(/\r\n?|\n/);
  let openFence: { marker: string; bodyStartIndex: number } | null = null;

  for (const [index, line] of lines.entries()) {
    const match = line.match(fencePattern);

    if (!match) {
      continue;
    }

    const [, marker, rest] = match;

    if (!openFence) {
      // NOTE: A backtick fence info string cannot contain backticks (CommonMark), such a line is inline code.
      if (marker[0] !== '`' || !rest.includes('`')) {
        openFence = { marker, bodyStartIndex: index + 1 };
      }
    } else if (marker[0] === openFence.marker[0] && marker.length >= openFence.marker.length && !rest.trim()) {
      openFence = null;
    }
  }

  return openFence ? lines.slice(openFence.bodyStartIndex).join('\n') : null;
};

const normalizeFenceContent = (content: string): string => content.replace(linePrefixPattern, '').trim();

/**
 * Whether a code block rendered by a markdown renderer is the still-open fence returned by `getOpenFenceBody`.
 * Line prefixes (indentation, `>`) are ignored, renderers strip them from the block content.
 */
export const isOpenFenceContent = (content: string, openFenceBody: string | null): boolean =>
  openFenceBody !== null && normalizeFenceContent(content) === normalizeFenceContent(openFenceBody);
