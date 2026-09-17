import { BottomSheetModal } from '@gorhom/bottom-sheet';
import { useTranslation } from '@ronas-it/react-native-common-modules/i18n';
import { ForwardedRef, ReactElement, useImperativeHandle, useRef, useState } from 'react';
import { SearchableListBottomSheet } from '@open-webui-react-native/mobile/shared/ui/ui-kit';
import { Knowledge, knowledgeApi } from '@open-webui-react-native/shared/data-access/api';
import { useDebouncedQuery } from '@open-webui-react-native/shared/utils/use-debounced-query';
import { KnowledgeRow } from './components';

export type SelectKnowledgeSheetMethods = {
  present: (selectedKnowledge: Array<Knowledge>) => void;
};

export type SelectKnowledgeSheetRef = ForwardedRef<SelectKnowledgeSheetMethods>;

export type SelectKnowledgeSheetProps = {
  onConfirm: (selectedKnowledge: Array<Knowledge>) => void;
  ref?: SelectKnowledgeSheetRef;
};

const extractKnowledgeId = (knowledge: Knowledge): string => knowledge.id;

export function SelectKnowledgeSheet({ onConfirm, ref }: SelectKnowledgeSheetProps): ReactElement {
  const translate = useTranslation('FOLDER.SELECT_KNOWLEDGE_SHEET');
  const sheetRef = useRef<BottomSheetModal>(null);
  const { query, setQuery, debouncedQuery } = useDebouncedQuery({ delay: 300 });

  const [selectedKnowledge, setSelectedKnowledge] = useState<Array<Knowledge>>([]);

  const {
    data: knowledge,
    isLoading,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = knowledgeApi.useSearchKnowledge(debouncedQuery);

  const closeModal = (): void => sheetRef.current?.close();

  const openModal = (): void => sheetRef.current?.present();

  const handleConfirm = (): void => {
    onConfirm(selectedKnowledge);
    closeModal();
  };

  const handlePresent = (initialSelectedKnowledge: Array<Knowledge>): void => {
    setSelectedKnowledge(initialSelectedKnowledge);
    setQuery('');
    openModal();
  };

  const handleFetchNextPage = (): void => {
    if (hasNextPage) {
      fetchNextPage();
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

  const renderItem = ({ item }: { item: Knowledge }): ReactElement => {
    const isSelected = selectedKnowledge.some((knowledge) => knowledge.id === item.id);
    const handlePress = (): void => toggleKnowledgeSelection(item);

    return <KnowledgeRow
      item={item}
      onPress={handlePress}
      isSelected={isSelected} />;
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
      isLoading={isLoading}
      emptyDescription={translate('TEXT_NO_KNOWLEDGE')}
      data={knowledge ?? []}
      extraData={selectedKnowledge}
      renderItem={renderItem}
      keyExtractor={extractKnowledgeId}
      pagination={{ onEndReached: handleFetchNextPage, isFetchingNextPage }}
    />
  );
}
