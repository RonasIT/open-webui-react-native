// NOTE: Only reasoning and tool-call blocks are removed; a `<details>` the model wrote itself is part of
// the answer. Quoted attribute values may contain `>`.
const DETAILS_BLOCK_REGEX =
  /<\s*details\b(?=(?:"(?:\\.|[^"\\])*"|[^">])*?\btype\s*=\s*"(?:reasoning|tool_calls)")(?:"(?:\\.|[^"\\])*"|[^">])*>[\s\S]*?<\s*\/\s*details\s*>/gi;

export const removeDetailsBlocks = (text: string): string => text.replace(DETAILS_BLOCK_REGEX, '').trim();
