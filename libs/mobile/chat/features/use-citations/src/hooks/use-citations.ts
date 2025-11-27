import { delay } from 'lodash-es';
import { RefObject, useMemo, useRef, useState } from 'react';
import { AppModalHandle } from '@open-webui-react-native/mobile/shared/ui/ui-kit';
import { MessageSource } from '@open-webui-react-native/shared/data-access/common';
import { Citation } from '../types';
import { normalizeCitations } from '../utils';

interface UseCitationsResult {
  citations: Array<Citation>;
  selectedCitation?: Citation;
  sourceCitationModalRef: RefObject<AppModalHandle | null>;
  handleCitationPress: (citation: Citation) => void;
  handleInlineCitationPress: (id: string) => void;
}

export function useCitations(sources: Array<MessageSource> = []): UseCitationsResult {
  const citations: Array<Citation> = useMemo(() => normalizeCitations(sources), [sources]);
  const [selectedCitation, setSelectedCitation] = useState<Citation>();

  const sourceCitationModalRef = useRef<AppModalHandle | null>(null);

  const openModal = (): void => {
    delay(() => sourceCitationModalRef.current?.open(), 125);
  };

  const handleCitationPress = (citation: Citation): void => {
    setSelectedCitation(citation);
    openModal();
  };

  const handleInlineCitationPress = (id: string): void => {
    setSelectedCitation(citations.find((cit) => cit.id === id));
    openModal();
  };

  return {
    citations,
    selectedCitation,
    sourceCitationModalRef,
    handleCitationPress,
    handleInlineCitationPress,
  };
}
