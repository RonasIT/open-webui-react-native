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

const extractId = (item: { id: string }): string => item.id;

export function AttachKnowledgeSheet({
  ref,
  isCollectionAttached,
  isFileAttached,
  onSelectCollection,
  onSelectFile,
}: AttachKnowledgeSheetProps): ReactElement {
  const translate = useTranslation('CHAT.ATTACH_KNOWLEDGE_SHEET');
  const sheetRef = useRef<BottomSheetModal>(null);
  const { query, setQuery, debouncedQuery } = useDebouncedQuery({ delay: 300 });

  const [openedKnowledge, setOpenedKnowledge] = useState<Knowledge | null>(null);

  const {
    data: knowledgeList,
    isLoading: isKnowledgeLoading,
    fetchNextPage: fetchNextKnowledgePage,
    hasNextPage: hasNextKnowledgePage,
    isFetchingNextPage: isFetchingNextKnowledgePage,
  } = knowledgeApi.useSearchKnowledge(debouncedQuery);
  const {
    data: knowledgeFiles,
    isLoading: isFilesLoading,
    fetchNextPage: fetchNextFilesPage,
    hasNextPage: hasNextFilesPage,
    isFetchingNextPage: isFetchingNextFilesPage,
  } = knowledgeApi.useGetKnowledgeFiles(openedKnowledge?.id, debouncedQuery);

  const closeModal = (): void => {
    sheetRef.current?.close();
  };

  const openModal = (): void => {
    setQuery('');
    sheetRef.current?.present();
  };

  useImperativeHandle(ref, () => ({ present: openModal }), []);

  const handleDismiss = (): void => {
    setOpenedKnowledge(null);
    setQuery('');
  };

  const handleGoBack = (): void => {
    if (openedKnowledge) {
      setOpenedKnowledge(null);
      setQuery('');

      return;
    }

    closeModal();
  };

  const handleShowFiles = (knowledge: Knowledge): void => {
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

  const handleFetchNextKnowledgePage = (): void => {
    if (hasNextKnowledgePage) {
      fetchNextKnowledgePage();
    }
  };

  const handleFetchNextFilesPage = (): void => {
    if (hasNextFilesPage) {
      fetchNextFilesPage();
    }
  };

  if (openedKnowledge) {
    const renderFileItem = ({ item }: { item: FileData }): ReactElement => {
      const handlePress = (): void => handleSelectFile(openedKnowledge, item);

      return <KnowledgeFileRow
        item={item}
        isSelected={isFileAttached(item.id)}
        onPress={handlePress} />;
    };

    return (
      <SearchableListBottomSheet
        ref={sheetRef}
        title={openedKnowledge.name}
        onGoBack={handleGoBack}
        onDismiss={handleDismiss}
        query={query}
        onQueryChange={setQuery}
        searchPlaceholder={translate('TEXT_SEARCH_FILES')}
        isLoading={isFilesLoading}
        emptyDescription={translate('TEXT_NO_FILES')}
        data={knowledgeFiles ?? []}
        keyExtractor={extractId}
        pagination={{ onEndReached: handleFetchNextFilesPage, isFetchingNextPage: isFetchingNextFilesPage }}
        renderItem={renderFileItem}
      />
    );
  }

  const renderKnowledgeItem = ({ item }: { item: Knowledge }): ReactElement => {
    const handlePress = (): void => handleSelectCollection(item);
    const handleShowFilesPress = (): void => handleShowFiles(item);

    return (
      <KnowledgeBaseRow
        item={item}
        isSelected={isCollectionAttached(item.id)}
        onPress={handlePress}
        onShowFilesPress={handleShowFilesPress}
      />
    );
  };

  return (
    <SearchableListBottomSheet
      ref={sheetRef}
      title={translate('TEXT_TITLE')}
      onGoBack={closeModal}
      onDismiss={handleDismiss}
      query={query}
      onQueryChange={setQuery}
      searchPlaceholder={translate('TEXT_SEARCH_KNOWLEDGE')}
      isLoading={isKnowledgeLoading}
      emptyDescription={translate('TEXT_NO_KNOWLEDGE')}
      data={knowledgeList ?? []}
      keyExtractor={extractId}
      pagination={{ onEndReached: handleFetchNextKnowledgePage, isFetchingNextPage: isFetchingNextKnowledgePage }}
      renderItem={renderKnowledgeItem}
    />
  );
}
