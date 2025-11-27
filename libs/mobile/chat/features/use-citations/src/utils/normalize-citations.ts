import { replace } from 'lodash-es';
import { MessageSource, Source } from '@open-webui-react-native/shared/data-access/common';
import { Citation } from '../types';

export const normalizeCitations = (sources: Array<MessageSource> = []): Array<Citation> => {
  return sources.reduce<Array<Citation>>((acc, source) => {
    if (!source || Object.keys(source).length === 0) return acc;

    source.document.forEach((document, index) => {
      const metadata = source.metadata?.[index];
      const distance = source.distances?.[index];

      const id = replace(
        decodeURIComponent(metadata?.source ?? source.source?.id ?? 'N/A').replace(/\p{Emoji}/gu, ''),
        /\s+/g,
        '',
      );

      let sourceData: Partial<Source> & { url?: string } = { ...source.source };

      if (metadata?.name) {
        sourceData = { ...sourceData, name: metadata.name };
      }

      if (id.startsWith('http://') || id.startsWith('https://')) {
        sourceData = { ...sourceData, name: id, url: id };
      }

      const existing = acc.find((item) => item.id === id);

      if (existing) {
        existing.document.push(document);
        if (metadata) existing.metadata.push(metadata);

        if (distance !== undefined) {
          if (!existing.distances) existing.distances = [];
          existing.distances.push(distance);
        }
      } else {
        acc.push({
          id,
          source: sourceData,
          document: [document],
          metadata: metadata ? [metadata] : [],
          distances: distance !== undefined ? [distance] : undefined,
        });
      }
    });

    return acc;
  }, []);
};
