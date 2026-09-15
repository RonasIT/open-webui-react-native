import { BottomSheetModal } from '@gorhom/bottom-sheet';
import { useTranslation } from '@ronas-it/react-native-common-modules/i18n';
import { ForwardedRef, ReactElement, useImperativeHandle, useRef, useState } from 'react';
import { SearchableListBottomSheet } from '@open-webui-react-native/mobile/shared/ui/ui-kit';
import { Knowledge, knowledgeApi } from '@open-webui-react-native/shared/data-access/api';
import { FileData } from '@open-webui-react-native/shared/data-access/common';
import { useDebouncedQuery } from '@open-webui-react-native/shared/utils/use-debounced-query';
import { KnowledgeBaseRow, KnowledgeFileRow } from './components';

export type AttachKnowledgeSheetMethods = {
  present: () => void;
};

export type AttachKnowledgeSheetRef = ForwardedRef<AttachKnowledgeSheetMethods>;

export interface AttachKnowledgeSheetProps {
  ref?: AttachKnowledgeSheetRef;
  isCollectionAttached: (id: string) => boolean;
  isFileAttached: (id: string) => boolean;
  onSelectCollection: (knowledge: Knowledge) => void;
  onSelectFile: (knowledge: Knowledge, file: FileData) => void;
}

export function AttachKnowledgeSheet({
  ref,
  isCollectionAttached,
  isFileAttached,
  onSelectCollection,
  onSelectFile,
}: AttachKnowledgeSheetProps): ReactElement {
  const translate = useTranslation('CHAT.ATTACH_KNOWLEDGE_SHEET');
  const sheetRef = useRef<BottomSheetModal>(null);

  const [openedKnowledge, setOpenedKnowledge] = useState<Knowledge | null>(null);

  const { query, setQuery } = useDebouncedQuery();

  const { data: knowledgeList, isLoading: isKnowledgeLoading } = knowledgeApi.useGetKnowledge();
  const {
    data: knowledgeFiles,
    isLoading: isFilesLoading,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = knowledgeApi.useGetKnowledgeFiles(openedKnowledge?.id);

  const closeModal = (): void => {
    sheetRef.current?.close();
    setOpenedKnowledge(null);
    setQuery('');
  };

  const openModal = (): void => sheetRef.current?.present();

  useImperativeHandle(ref, () => ({ present: openModal }), []);

  const handleGoBack = (): void => {
    if (openedKnowledge) {
      setOpenedKnowledge(null);
      setQuery('');

      return;
    }

    closeModal();
  };

  const handleShowFilesPress = (knowledge: Knowledge): void => {
    setQuery('');
    setOpenedKnowledge(knowledge);
  };

  const handleSelectCollection = (knowledge: Knowledge): void => {
    onSelectCollection(knowledge);
    closeModal();
  };

  const handleSelectFile = (knowledge: Knowledge, file: FileData): void => {
    onSelectFile(knowledge, file);
    closeModal();
  };

  if (openedKnowledge) {
    const files = (knowledgeFiles ?? []).filter((file) => new RegExp(query, 'i').test(file.meta.name));

    return (
      <SearchableListBottomSheet
        ref={sheetRef}
        title={openedKnowledge.name}
        onGoBack={handleGoBack}
        searchQuery={query}
        onSearchQueryChange={setQuery}
        searchPlaceholder={translate('TEXT_SEARCH_FILES')}
        isLoading={isFilesLoading}
        emptyDescription={translate('TEXT_NO_FILES')}
        data={files}
        keyExtractor={(item) => item.id}
        onEndReached={() => hasNextPage && fetchNextPage()}
        isFetchingNextPage={isFetchingNextPage}
        renderItem={({ item }) => (
          <KnowledgeFileRow
            item={item}
            isSelected={isFileAttached(item.id)}
            onPress={() => handleSelectFile(openedKnowledge, item)}
          />
        )}
      />
    );
  }

  const filteredKnowledge = (knowledgeList ?? []).filter((item) => new RegExp(query, 'i').test(item.name));

  return (
    <SearchableListBottomSheet
      ref={sheetRef}
      title={translate('TEXT_TITLE')}
      onGoBack={closeModal}
      searchQuery={query}
      onSearchQueryChange={setQuery}
      searchPlaceholder={translate('TEXT_SEARCH_KNOWLEDGE')}
      isLoading={isKnowledgeLoading}
      emptyDescription={translate('TEXT_NO_KNOWLEDGE')}
      data={filteredKnowledge}
      keyExtractor={(item) => item.id}
      renderItem={({ item }) => (
        <KnowledgeBaseRow
          item={item}
          isSelected={isCollectionAttached(item.id)}
          onPress={() => handleSelectCollection(item)}
          onShowFilesPress={() => handleShowFilesPress(item)}
        />
      )}
    />
  );
}
