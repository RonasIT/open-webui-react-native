import { BottomSheetModal } from '@gorhom/bottom-sheet';
import { useTranslation } from '@ronas-it/react-native-common-modules/i18n';
import { ForwardedRef, ReactElement, useImperativeHandle, useRef, useState } from 'react';
import { SearchableListBottomSheet } from '@open-webui-react-native/mobile/shared/ui/ui-kit';
import { Knowledge, knowledgeApi } from '@open-webui-react-native/shared/data-access/api';
import { FileData } from '@open-webui-react-native/shared/data-access/common';
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

const matchesKnowledgeQuery = (knowledge: Knowledge, query: string): boolean =>
  new RegExp(query, 'i').test(knowledge.name);

const matchesFileQuery = (file: FileData, query: string): boolean => new RegExp(query, 'i').test(file.meta.name);

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

  const [openedKnowledge, setOpenedKnowledge] = useState<Knowledge | null>(null);

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
  };

  const openModal = (): void => sheetRef.current?.present();

  useImperativeHandle(ref, () => ({ present: openModal }), []);

  const handleGoBack = (): void => {
    if (openedKnowledge) {
      setOpenedKnowledge(null);

      return;
    }

    closeModal();
  };

  const handleShowFiles = (knowledge: Knowledge): void => setOpenedKnowledge(knowledge);

  const handleSelectCollection = (knowledge: Knowledge): void => {
    onSelectCollection(knowledge);
    closeModal();
  };

  const handleSelectFile = (knowledge: Knowledge, file: FileData): void => {
    onSelectFile(knowledge, file);
    closeModal();
  };

  const handleFetchNextPage = (): void => {
    if (hasNextPage) {
      fetchNextPage();
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
        searchPlaceholder={translate('TEXT_SEARCH_FILES')}
        searchResetKey={openedKnowledge.id}
        isLoading={isFilesLoading}
        emptyDescription={translate('TEXT_NO_FILES')}
        data={knowledgeFiles ?? []}
        searchPredicate={matchesFileQuery}
        keyExtractor={extractId}
        pagination={{ onEndReached: handleFetchNextPage, isFetchingNextPage }}
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
      searchPlaceholder={translate('TEXT_SEARCH_KNOWLEDGE')}
      searchResetKey='root'
      isLoading={isKnowledgeLoading}
      emptyDescription={translate('TEXT_NO_KNOWLEDGE')}
      data={knowledgeList ?? []}
      searchPredicate={matchesKnowledgeQuery}
      keyExtractor={extractId}
      renderItem={renderKnowledgeItem}
    />
  );
}
