import { BottomSheetModal } from '@gorhom/bottom-sheet';
import { useTranslation } from '@ronas-it/react-native-common-modules/i18n';
import { ForwardedRef, ReactElement, useImperativeHandle, useRef, useState } from 'react';
import { AppText, SearchableListBottomSheet, View } from '@open-webui-react-native/mobile/shared/ui/ui-kit';
import { Knowledge, knowledgeApi } from '@open-webui-react-native/shared/data-access/api';
import { FileData } from '@open-webui-react-native/shared/data-access/common';
import { useDebouncedQuery } from '@open-webui-react-native/shared/utils/use-debounced-query';
import { KnowledgeFileRow, KnowledgeRow } from './components';
import { ListItemType } from './enums';

export type SelectKnowledgeSheetMethods = {
  present: (selection: { knowledge: Array<Knowledge>; files: Array<FileData> }) => void;
};

export type SelectKnowledgeSheetRef = ForwardedRef<SelectKnowledgeSheetMethods>;

export type SelectKnowledgeSheetProps = {
  onConfirm: (selection: { knowledge: Array<Knowledge>; files: Array<FileData> }) => void;
  ref?: SelectKnowledgeSheetRef;
};

type ListItem =
  | { type: ListItemType.KNOWLEDGE_HEADER }
  | { type: ListItemType.KNOWLEDGE_EMPTY }
  | { type: ListItemType.KNOWLEDGE; knowledge: Knowledge }
  | { type: ListItemType.FILES_HEADER }
  | { type: ListItemType.FILES_EMPTY }
  | { type: ListItemType.FILE; file: FileData };

export function SelectKnowledgeSheet({ onConfirm, ref }: SelectKnowledgeSheetProps): ReactElement {
  const translate = useTranslation('FOLDER.SELECT_KNOWLEDGE_SHEET');
  const sheetRef = useRef<BottomSheetModal>(null);
  const { query, setQuery, debouncedQuery } = useDebouncedQuery({ delay: 300 });

  const [selectedKnowledge, setSelectedKnowledge] = useState<Array<Knowledge>>([]);
  const [selectedFiles, setSelectedFiles] = useState<Array<FileData>>([]);

  const {
    data: knowledge,
    isLoading: isKnowledgeLoading,
    fetchNextPage: fetchNextKnowledgePage,
    hasNextPage: hasNextKnowledgePage,
    isFetchingNextPage: isFetchingNextKnowledgePage,
  } = knowledgeApi.useSearchKnowledge(debouncedQuery);
  const {
    data: files,
    isLoading: isFilesLoading,
    fetchNextPage: fetchNextFilesPage,
    hasNextPage: hasNextFilesPage,
    isFetchingNextPage: isFetchingNextFilesPage,
  } = knowledgeApi.useSearchKnowledgeFiles(debouncedQuery);

  const closeModal = (): void => sheetRef.current?.close();

  const openModal = (): void => sheetRef.current?.present();

  const handleConfirm = (): void => {
    onConfirm({ knowledge: selectedKnowledge, files: selectedFiles });
    closeModal();
  };

  const handlePresent = (initialSelection: { knowledge: Array<Knowledge>; files: Array<FileData> }): void => {
    setSelectedKnowledge(initialSelection.knowledge);
    setSelectedFiles(initialSelection.files);
    setQuery('');
    openModal();
  };

  const handleFetchNextPage = (): void => {
    if (hasNextKnowledgePage) {
      fetchNextKnowledgePage();
    }

    if (hasNextFilesPage) {
      fetchNextFilesPage();
    }
  };

  useImperativeHandle(ref, () => ({ present: handlePresent }), []);

  const toggleKnowledgeSelection = (item: Knowledge): void => {
    setSelectedKnowledge((prev) =>
      prev.some((knowledge) => knowledge.id === item.id)
        ? prev.filter((knowledge) => knowledge.id !== item.id)
        : [...prev, item],
    );
  };

  const toggleFileSelection = (item: FileData): void => {
    setSelectedFiles((prev) =>
      prev.some((file) => file.id === item.id) ? prev.filter((file) => file.id !== item.id) : [...prev, item],
    );
  };

  const data: Array<ListItem> =
    !knowledge?.length && !files?.length
      ? []
      : [
          { type: ListItemType.KNOWLEDGE_HEADER },
          ...(knowledge?.length
            ? knowledge.map((item): ListItem => ({ type: ListItemType.KNOWLEDGE, knowledge: item }))
            : [{ type: ListItemType.KNOWLEDGE_EMPTY } as ListItem]),
          { type: ListItemType.FILES_HEADER },
          ...(files?.length
            ? files.map((item): ListItem => ({ type: ListItemType.FILE, file: item }))
            : [{ type: ListItemType.FILES_EMPTY } as ListItem]),
        ];

  const renderItem = ({ item }: { item: ListItem }): ReactElement => {
    switch (item.type) {
      case ListItemType.KNOWLEDGE_HEADER:
        return (
          <View className='pt-16 pb-4'>
            <AppText className='text-sm-sm sm:text-sm text-text-tertiary'>{translate('TEXT_COLLECTIONS')}</AppText>
          </View>
        );
      case ListItemType.KNOWLEDGE_EMPTY:
        return (
          <View className='py-12'>
            <AppText className='text-sm-sm sm:text-sm'>{translate('TEXT_NO_KNOWLEDGE')}</AppText>
          </View>
        );

      case ListItemType.KNOWLEDGE: {
        const isSelected = selectedKnowledge.some((knowledge) => knowledge.id === item.knowledge.id);
        const handlePress = (): void => toggleKnowledgeSelection(item.knowledge);

        return <KnowledgeRow
          item={item.knowledge}
          onPress={handlePress}
          isSelected={isSelected} />;
      }
      case ListItemType.FILES_HEADER:
        return (
          <View className='pt-16 pb-4'>
            <AppText className='text-sm-sm sm:text-sm text-text-tertiary'>{translate('TEXT_FILES')}</AppText>
          </View>
        );
      case ListItemType.FILES_EMPTY:
        return (
          <View className='py-12'>
            <AppText className='text-sm-sm sm:text-sm'>{translate('TEXT_NO_FILES')}</AppText>
          </View>
        );

      case ListItemType.FILE: {
        const isSelected = selectedFiles.some((file) => file.id === item.file.id);
        const handlePress = (): void => toggleFileSelection(item.file);

        return <KnowledgeFileRow
          item={item.file}
          onPress={handlePress}
          isSelected={isSelected} />;
      }
    }
  };

  const keyExtractor = (item: ListItem): string => {
    if (item.type === ListItemType.KNOWLEDGE) {
      return `${item.type}-${item.knowledge.id}`;
    }

    if (item.type === ListItemType.FILE) {
      return `${item.type}-${item.file.id}`;
    }

    return item.type;
  };

  return (
    <SearchableListBottomSheet
      ref={sheetRef}
      title={translate('TEXT_SELECT_KNOWLEDGE')}
      onGoBack={closeModal}
      headerProps={{ onConfirmPress: handleConfirm }}
      query={query}
      onQueryChange={setQuery}
      searchPlaceholder={translate('TEXT_SEARCH_KNOWLEDGE')}
      isLoading={isKnowledgeLoading || isFilesLoading}
      emptyDescription={translate('TEXT_NO_KNOWLEDGE')}
      data={data}
      extraData={[selectedKnowledge, selectedFiles]}
      renderItem={renderItem}
      keyExtractor={keyExtractor}
      pagination={{
        onEndReached: handleFetchNextPage,
        isFetchingNextPage: isFetchingNextKnowledgePage || isFetchingNextFilesPage,
      }}
    />
  );
}
