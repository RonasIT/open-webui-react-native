const fencePrefix = '^[ \\t]*(?:>[ \\t]*)*';
const fencePattern = new RegExp(`${fencePrefix}(\`{3,}|~{3,})`);
const indentedCodePattern = /^( {4}|\t)/;
const listItemPattern = /^ {0,3}([-*+]|\d{1,9}[.)])(\s|$)/;

// NOTE: Block math may span blank lines only when its opener is alone on the line, so an escaped `\[` in prose
// does not swallow the following paragraphs up to a later formula.
const inlinePattern =
  /\\\\|(`+)(?:[^\n]|\n(?![ \t]*\n))*?\1|^([ \t]*(?:>[ \t]*)*(?:(?:[-*+]|\d{1,9}[.)])[ \t]+)?)(?:\\\[([ \t]*\n[\s\S]*?)\\\]|\\begin\{equation\}([ \t]*\n[\s\S]*?)\\end\{equation\})|\\\[((?:[^\n]|\n(?![ \t]*\n))*?)\\\]|\\begin\{equation\}((?:[^\n]|\n(?![ \t]*\n))*?)\\end\{equation\}|\\\(((?:[^\n]|\n(?![ \t]*\n))*?)\\\)/gm;
const boundaryPattern = /[\s!-#%-/:-@[\]-`{-~]/;

const convertMath = (text: string): string =>
  text.replace(
    inlinePattern,
    (
      match: string,
      code?: string,
      linePrefix?: string,
      lineDisplay?: string,
      lineEquation?: string,
      display?: string,
      equation?: string,
      inline?: string,
      offset = 0,
    ): string => {
      if (code || match === '\\\\') {
        return match;
      }

      const blockContent = lineDisplay ?? lineEquation;
      const isInline = inline !== undefined;
      const content = isInline ? inline.trim() : (display ?? equation ?? blockContent ?? '').trim();

      if (!content) {
        return match;
      }

      const after = text[offset + match.length];
      const suffix = after && !boundaryPattern.test(after) ? ' ' : '';

      if (blockContent !== undefined) {
        // NOTE: Blank lines are dropped, otherwise block math with a blank line inside is shown as raw text.
        return `${linePrefix}$$${blockContent.replace(/\n(?:[ \t]*\n)+/g, '\n')}$$${suffix}`;
      }

      const delimiter = isInline ? '$' : '$$';
      const before = text[offset - 1];
      const prefix = before && !boundaryPattern.test(before) ? ' ' : '';

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
