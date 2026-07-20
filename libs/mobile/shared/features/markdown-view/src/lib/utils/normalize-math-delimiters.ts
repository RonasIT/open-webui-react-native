const FENCE_PLACEHOLDER = '\0FENCE';
const INLINE_CODE_PLACEHOLDER = '\0INLINE';

function protectSegments(markdown: string, pattern: RegExp, placeholder: string, store: Array<string>): string {
  return markdown.replace(pattern, (match) => {
    const index = store.length;
    store.push(match);

    return `${placeholder}${index}\0`;
  });
}

function restoreSegments(markdown: string, placeholder: string, store: Array<string>): string {
  return markdown.replace(new RegExp(`${placeholder}(\\d+)\\0`, 'g'), (_, index: string) => {
    return store[Number(index)] ?? '';
  });
}

/**
 * md4c math spans are inline-only and cannot cross markdown block boundaries.
 * Multiline `$$...$$` (common LLM output) often gets split into paragraphs /
 * setext headings (a lone `=` line), so collapse display math onto one line.
 */
function collapseDisplayMathBlocks(markdown: string): string {
  let result = '';
  let index = 0;

  while (index < markdown.length) {
    if (markdown.startsWith('$$', index)) {
      const closeIndex = markdown.indexOf('$$', index + 2);

      if (closeIndex === -1) {
        result += markdown.slice(index);
        break;
      }

      const content = markdown
        .slice(index + 2, closeIndex)
        .replace(/\s*\n\s*/g, ' ')
        .trim();

      result += `$$${content}$$`;
      index = closeIndex + 2;
      continue;
    }

    result += markdown[index];
    index += 1;
  }

  return result;
}

/**
 * Nitro/md4c only recognizes `$...$` (inline) and `$$...$$` (display).
 * Open WebUI / markdown-it also emit `\(...\)`, `\[...\]`, `\begin{equation}`, `\ce{}`, `\pu{}`.
 * Normalize those to dollar delimiters and flatten multiline display math before Nitro parses.
 */
export function normalizeMathDelimiters(markdown: string): string {
  if (!markdown) {
    return markdown;
  }

  const fences: Array<string> = [];
  const inlineCodes: Array<string> = [];

  let result = protectSegments(markdown, /```[\s\S]*?```/g, FENCE_PLACEHOLDER, fences);
  result = protectSegments(result, /`[^`\n]+`/g, INLINE_CODE_PLACEHOLDER, inlineCodes);

  result = result.replace(/\\begin\{equation\}([\s\S]*?)\\end\{equation\}/g, (_, content: string) => {
    return `$$${content}$$`;
  });

  result = result.replace(/\\\[([\s\S]*?)\\\]/g, (_, content: string) => {
    return `$$${content}$$`;
  });

  result = collapseDisplayMathBlocks(result);

  result = result.replace(/\\\(([\s\S]*?)\\\)/g, (_, content: string) => {
    return `$${content.replace(/\s*\n\s*/g, ' ').trim()}$`;
  });

  result = result.replace(/\\ce\{([^{}]*)\}/g, (_, content: string) => {
    return `$\\ce{${content}}$`;
  });

  result = result.replace(/\\pu\{([^{}]*)\}/g, (_, content: string) => {
    return `$\\pu{${content}}$`;
  });

  result = restoreSegments(result, INLINE_CODE_PLACEHOLDER, inlineCodes);
  result = restoreSegments(result, FENCE_PLACEHOLDER, fences);

  return result;
}
