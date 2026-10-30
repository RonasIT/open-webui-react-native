// NOTE: Raw as the attribute carried it — the payload is HTML-escaped and often JSON stringified
// more than once, and untangling that is presentation, done once for both message shapes in
// `buildToolCallViews`.
export type ToolData = {
  id?: string;
  toolName: string;
  rawArguments: string;
  rawOutput: string;
};

export type ReasoningData = {
  isDone: boolean;
  duration?: number;
  text: string;
};

export type DetailsBlock = { type: 'tool_calls'; tool: ToolData } | { type: 'reasoning'; reasoning: ReasoningData };

export type ParseResponseMessageContentResult = {
  detailsBlocks: Array<DetailsBlock>;
  messageContent: string;
};

const unescapeAttributeValue = (value: string): string =>
  value.replace(/\\(u[0-9a-fA-F]{4}|["'\\ntr])/g, (_, esc: string) => {
    switch (esc) {
      case 'n':
        return '\n';
      case 't':
        return '\t';
      case 'r':
        return '\r';
      case '"':
        return '"';
      case '\'':
        return '\'';
      case '\\':
        return '\\';
      default:
        return esc.startsWith('u') ? String.fromCharCode(parseInt(esc.slice(1), 16)) : esc;
    }
  });

const parseTagAttributes = (tag: string): Record<string, string> => {
  const attrs: Record<string, string> = {};
  const attrRe = /([^\s=/>]+)\s*=\s*(?:"((?:\\.|[^"])*)"|'((?:\\.|[^'])*)')/g;

  let match: RegExpExecArray | null;

  while ((match = attrRe.exec(tag)) !== null) {
    const [, rawName, doubleQuoted, singleQuoted] = match;
    const rawValue = doubleQuoted ?? singleQuoted ?? '';
    attrs[rawName.toLowerCase()] = unescapeAttributeValue(rawValue);
  }

  return attrs;
};

const indexAfterOpenDetailsTag = (s: string): number => {
  const open = s.match(/^<\s*details\b/i);

  if (!open) {
    return -1;
  }
  let i = open[0].length;
  let inDouble = false;
  let escape = false;

  while (i < s.length) {
    const c = s[i];

    if (escape) {
      escape = false;
      i++;
      continue;
    }

    if (c === '\\') {
      escape = true;
      i++;
      continue;
    }

    if (c === '"') {
      inDouble = !inDouble;
      i++;
      continue;
    }

    if (c === '>' && !inDouble) {
      return i + 1;
    }
    i++;
  }

  return -1;
};

interface RawDetailsBlock {
  start: number;
  end: number;
  attrs: Record<string, string>;
  body: string;
}

const findNextDetailsBlock = (content: string, fromIndex: number): RawDetailsBlock | null => {
  const openRe = /<\s*details\b/gi;
  openRe.lastIndex = fromIndex;
  const open = openRe.exec(content);

  if (!open) {
    return null;
  }

  const fromDetails = content.slice(open.index);
  const openEnd = indexAfterOpenDetailsTag(fromDetails);

  if (openEnd === -1) {
    return null;
  }

  const closeMatch = fromDetails.slice(openEnd).match(/<\s*\/\s*details\s*>/i);

  if (!closeMatch || closeMatch.index === undefined) {
    return null;
  }

  return {
    start: open.index,
    end: open.index + openEnd + closeMatch.index + closeMatch[0].length,
    attrs: parseTagAttributes(fromDetails.slice(0, openEnd)),
    body: fromDetails.slice(openEnd, openEnd + closeMatch.index),
  };
};

const toToolData = (attrs: Record<string, string>): ToolData => ({
  id: attrs.id ?? undefined,
  toolName: attrs.name ?? '',
  rawArguments: attrs.arguments ?? '',
  rawOutput: attrs.result ?? '',
});

// NOTE: Open WebUI up to 0.9 stored reasoning in the text as `<details type="reasoning">` with every line quoted.
const toReasoningData = (attrs: Record<string, string>, body: string): ReasoningData => {
  const duration = attrs.duration ? Number(attrs.duration) : NaN;

  return {
    isDone: attrs.done === 'true',
    duration: Number.isFinite(duration) ? duration : undefined,
    text: body
      .replace(/<\s*summary\b[^>]*>[\s\S]*?<\s*\/\s*summary\s*>/i, '')
      .replace(/^ *> ?/gm, '')
      .trim(),
  };
};

// NOTE: Tool-call blocks are taken only from the leading run; a later `<details>` is the model's own markup.
export const parseResponseMessageContent = (content: string): ParseResponseMessageContentResult => {
  const detailsBlocks: Array<DetailsBlock> = [];
  let messageContent = '';
  let index = 0;
  let isLeadingRun = true;

  for (let block = findNextDetailsBlock(content, index); block; block = findNextDetailsBlock(content, index)) {
    const textBefore = content.slice(index, block.start);
    const type = (block.attrs.type ?? '').toLowerCase();

    isLeadingRun = isLeadingRun && !textBefore.trim();
    messageContent += textBefore;
    index = block.end;

    if (type === 'reasoning') {
      detailsBlocks.push({ type, reasoning: toReasoningData(block.attrs, block.body) });
    } else if (type === 'tool_calls' && isLeadingRun) {
      detailsBlocks.push({ type, tool: toToolData(block.attrs) });
    } else {
      isLeadingRun = false;
      messageContent += content.slice(block.start, block.end);
    }
  }

  // NOTE: Trimmed so a blank line from the model does not render as an empty paragraph.
  return { detailsBlocks, messageContent: (messageContent + content.slice(index)).trim() };
};
