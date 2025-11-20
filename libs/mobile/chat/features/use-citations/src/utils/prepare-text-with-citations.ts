import { CitationPrefix } from '../enums';
import { Citation } from '../types';

export const prepareTextWithCitations = (text: string, citations: Array<Citation>): string => {
  return text.replace(/\[(\d+)\]/g, (match, indexStr) => {
    const index = parseInt(indexStr, 10) - 1;
    const citation = citations[index];

    if (!citation) return match;

    const filename = decodeURIComponent(citation.source.name ?? `${CitationPrefix.CITATION} ${index + 1}`);

    return `[${filename}](${CitationPrefix.CITATION}${citation.id})`;
  });
};
