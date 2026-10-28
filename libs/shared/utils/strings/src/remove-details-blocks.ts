// NOTE: Quoted attribute values may contain `>`.
const DETAILS_BLOCK_REGEX = /<\s*details\b(?:"(?:\\.|[^"\\])*"|[^">])*>[\s\S]*?<\s*\/\s*details\s*>/gi;

export const removeDetailsBlocks = (text: string): string => text.replace(DETAILS_BLOCK_REGEX, '').trim();
