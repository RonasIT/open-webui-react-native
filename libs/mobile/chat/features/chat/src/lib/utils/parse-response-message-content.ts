import { decode } from 'html-entities';
import { isEmpty } from 'lodash-es';

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

const readQuotedAttr = (tag: string, attr: string): string | null => {
  const needle = `${attr}="`;
  const lower = tag.toLowerCase();
  const idx = lower.indexOf(needle.toLowerCase());

  if (idx === -1) {
    return null;
  }

  let i = idx + needle.length;
  let out = '';

  while (i < tag.length) {
    const c = tag[i];

    if (c === '\\' && i + 1 < tag.length) {
      const esc = tag[i + 1];

      if (esc === 'n') {
        out += '\n';
      } else if (esc === 't') {
        out += '\t';
      } else if (esc === 'r') {
        out += '\r';
      } else if (esc === '"') {
        out += '"';
      } else if (esc === '\\') {
        out += '\\';
      } else if (esc === 'u' && /^[0-9a-fA-F]{4}/.test(tag.slice(i + 2, i + 6))) {
        out += String.fromCharCode(parseInt(tag.slice(i + 2, i + 6), 16));
        i += 6;

        continue;
      } else {
        out += esc;
      }

      i += 2;

      continue;
    }

    if (c === '"') {
      break;
    }

    out += c;
    i++;
  }

  return out;
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

const parseJsonRecursive = (str: string): unknown => {
  let cur: unknown = str.trim();

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

const repairUtf8MisreadAsLatin1 = (s: string): string => {
  for (let j = 0; j < s.length; j++) {
    if (s.charCodeAt(j) > 255) {
      return s;
    }
  }

  const bytes = new Uint8Array(s.length);

  for (let j = 0; j < s.length; j++) {
    bytes[j] = s.charCodeAt(j);
  }

  return new TextDecoder('utf-8', { fatal: false }).decode(bytes);
};

const normalizeToolResultText = (s: string): string => {
  let t = String(s);

  t = repairUtf8MisreadAsLatin1(t);

  return t;
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

  if (!/type\s*=\s*["']?tool_calls["']?/i.test(openTag)) {
    return null;
  }

  const closeMatch = fromDetails.slice(openEnd).match(/<\s*\/\s*details\s*>/i);

  if (!closeMatch || closeMatch.index === undefined) {
    return null;
  }

  const id = readQuotedAttr(openTag, 'id') ?? undefined;
  const toolName = readQuotedAttr(openTag, 'name') ?? '';
  const argsRaw = readQuotedAttr(openTag, 'arguments') ?? '';
  const resultRaw = readQuotedAttr(openTag, 'result') ?? '';

  const inputPayload = classifyAndNormalizePayload(argsRaw);
  const outputPayload = classifyAndNormalizePayload(resultRaw);
  const parsedArgs = parseJsonRecursive(decode(argsRaw).trim());
  const input =
    typeof parsedArgs === 'object' && parsedArgs !== null && isEmpty(parsedArgs) ? undefined : inputPayload.normalized;

  const blockEnd = leadingWs.length + openEnd + closeMatch.index + closeMatch[0].length;
  const rest = content.slice(blockEnd).trimStart();

  return {
    tool: {
      id,
      toolName,
      input,
      output: normalizeToolResultText(outputPayload.normalized),
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
