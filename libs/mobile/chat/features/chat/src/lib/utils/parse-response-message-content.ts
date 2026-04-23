import { decode } from 'html-entities';
import { parseObjectToString } from '@open-webui-react-native/shared/utils/strings';

type PayloadContentType = 'json' | 'text';

export type ToolData = {
  id?: string;
  toolName: string;
  input: string | undefined;
  output: string;
  outputContentType: PayloadContentType;
};

export type ParseResponseMessageContentResult = {
  toolsData: Array<ToolData>;
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

const parseJsonRecursive = (str: string): string => {
  let cur = str.trim();

  for (let depth = 0; depth < 32; depth++) {
    if (typeof cur !== 'string') {
      return cur;
    }

    try {
      cur = JSON.parse(cur);
    } catch {
      return cur;
    }
  }

  return cur;
};

const classifyAndNormalizePayload = (raw: string): { contentType: PayloadContentType; normalized: string } => {
  const decoded = decode(raw).trim();
  const parsed = parseJsonRecursive(decoded);

  if (typeof parsed === 'object' && parsed !== null) {
    return { contentType: 'json', normalized: JSON.stringify(parsed, null, 2) };
  }

  return { contentType: 'text', normalized: String(parsed) };
};

const tryParseLeadingToolCallsDetails = (content: string): { tool: ToolData; rest: string } | null => {
  const leadingWs = content.match(/^\s*/)?.[0] ?? '';
  const fromDetails = content.slice(leadingWs.length);

  if (!fromDetails.toLowerCase().startsWith('<details')) {
    return null;
  }

  const openEnd = indexAfterOpenDetailsTag(fromDetails);

  if (openEnd === -1) {
    return null;
  }

  const openTag = fromDetails.slice(0, openEnd);
  const attrs = parseTagAttributes(openTag);

  if ((attrs.type ?? '').toLowerCase() !== 'tool_calls') {
    return null;
  }

  const closeMatch = fromDetails.slice(openEnd).match(/<\s*\/\s*details\s*>/i);

  if (!closeMatch || closeMatch.index === undefined) {
    return null;
  }

  const id = attrs.id ?? undefined;
  const toolName = attrs.name ?? '';
  const argsRaw = attrs.arguments ?? '';
  const resultRaw = attrs.result ?? '';

  const outputPayload = classifyAndNormalizePayload(resultRaw);
  const input = parseObjectToString(parseJsonRecursive(decode(argsRaw).trim()));
  const blockEnd = leadingWs.length + openEnd + closeMatch.index + closeMatch[0].length;
  const rest = content.slice(blockEnd).trimStart();

  return {
    tool: {
      id,
      toolName,
      input,
      output: outputPayload.normalized,
      outputContentType: outputPayload.contentType,
    },
    rest,
  };
};

export const parseResponseMessageContent = (content: string): ParseResponseMessageContentResult => {
  const toolsData: Array<ToolData> = [];
  let rest = content;

  for (;;) {
    const next = tryParseLeadingToolCallsDetails(rest);

    if (!next) {
      break;
    }
    toolsData.push(next.tool);
    rest = next.rest;
  }

  return { toolsData, messageContent: rest };
};
