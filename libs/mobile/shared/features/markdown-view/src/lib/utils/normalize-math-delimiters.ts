const fencePrefix = '^[ \\t]*(?:>[ \\t]*)*';
const fencePattern = new RegExp(`${fencePrefix}(\`{3,}|~{3,})`);
const indentedCodePattern = /^( {4}|\t)/;
const listItemPattern = /^ {0,3}([-*+]|\d{1,9}[.)])(\s|$)/;

const inlinePattern =
  /\\\\|(`+)(?:[^\n]|\n(?![ \t]*\n))*?\1|\\\[([\s\S]*?)\\\]|\\begin\{equation\}([\s\S]*?)\\end\{equation\}|\\\(((?:[^\n]|\n(?![ \t]*\n))*?)\\\)/g;
const boundaryPattern = /[\s!-#%-/:-@[\]-`{-~]/;

const convertMath = (text: string): string =>
  text.replace(
    inlinePattern,
    (match: string, code?: string, display?: string, equation?: string, inline?: string, offset = 0): string => {
      if (code || match === '\\\\') {
        return match;
      }

      const isInline = inline !== undefined;
      // NOTE: Blank lines are dropped, otherwise block math with a blank line inside is shown as raw text.
      const content = isInline ? inline.trim() : (display ?? equation ?? '').trim().replace(/\n[ \t]*\n/g, '\n');

      if (!content) {
        return match;
      }

      const delimiter = isInline ? '$' : '$$';
      const before = text[offset - 1];
      const after = text[offset + match.length];
      const prefix = before && !boundaryPattern.test(before) ? ' ' : '';
      const suffix = after && !boundaryPattern.test(after) ? ' ' : '';

      return `${prefix}${delimiter}${content}${delimiter}${suffix}`;
    },
  );

/**
 * Converts `\(…\)`, `\[…\]` and `\begin{equation}…\end{equation}` to `$`/`$$` delimiters
 * understood by react-native-nitro-markdown. Code blocks and code spans are left untouched;
 * unclosed delimiters (e.g. while streaming) stay as is.
 */
export const normalizeMathDelimiters = (markdown: string): string => {
  if (!markdown.includes('\\(') && !markdown.includes('\\[') && !markdown.includes('\\begin{equation}')) {
    return markdown;
  }

  const lines = markdown.replace(/\r\n?/g, '\n').split('\n');
  const output: Array<string> = [];
  let textLines: Array<string> = [];
  let closingFencePattern: RegExp | null = null;
  let isInList = false;
  let isPreviousBlankOrCode = true;

  const flushText = (): void => {
    if (textLines.length) {
      output.push(convertMath(textLines.join('\n')));
      textLines = [];
    }
  };

  for (const line of lines) {
    if (closingFencePattern) {
      output.push(line);

      if (closingFencePattern.test(line)) {
        closingFencePattern = null;
      }
      continue;
    }

    const fenceMatch = line.match(fencePattern);
    // NOTE: Indented lines inside lists are list content, not indented code.
    const isIndentedCode = !isInList && isPreviousBlankOrCode && indentedCodePattern.test(line) && !!line.trim();

    if (fenceMatch || isIndentedCode) {
      flushText();
      output.push(line);
      closingFencePattern = fenceMatch
        ? new RegExp(`${fencePrefix}${fenceMatch[1][0]}{${fenceMatch[1].length},}[ \\t]*$`)
        : null;
      isPreviousBlankOrCode = true;
      continue;
    }

    textLines.push(line);
    isPreviousBlankOrCode = !line.trim();

    if (listItemPattern.test(line)) {
      isInList = true;
    } else if (line.trim() && !/^\s/.test(line)) {
      isInList = false;
    }
  }

  flushText();

  return output.join('\n');
};
