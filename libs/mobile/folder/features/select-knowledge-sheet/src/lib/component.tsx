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

export function SelectKnowledgeSheet({ onConfirm, ref }: SelectKnowledgeSheetProps): ReactElement {
  const translate = useTranslation('FOLDER.SELECT_KNOWLEDGE_SHEET');
  const sheetRef = useRef<BottomSheetModal>(null);

  const [selectedKnowledge, setSelectedKnowledge] = useState<Array<Knowledge>>([]);

  const { query, setQuery } = useDebouncedQuery();

  const { data: knowledge, isLoading } = knowledgeApi.useGetKnowledge();

  const filteredData = (knowledge ?? []).filter((item) => new RegExp(query, 'i').test(item.name));

  const closeModal = (): void => sheetRef.current?.close();

  const openModal = (): void => sheetRef.current?.present();

  const handleConfirm = (): void => {
    onConfirm(selectedKnowledge);
    closeModal();
  };

  useImperativeHandle(ref, () => {
    return {
      present: (selectedKnowledge: Array<Knowledge>) => {
        setSelectedKnowledge(selectedKnowledge);
        openModal();
      },
    };
  }, []);

  const renderItem = ({ item }: { item: Knowledge }): ReactElement => {
    const isSelected = selectedKnowledge.some((knowledge) => knowledge.id === item.id);

    return (
      <KnowledgeRow
        item={item}
        onPress={() =>
          setSelectedKnowledge((prev) => (isSelected ? [...prev.filter((i) => i.id !== item.id)] : [...prev, item]))
        }
        isSelected={isSelected}
      />
    );
  };

  return (
    <SearchableListBottomSheet
      ref={sheetRef}
      title={translate('TEXT_SELECT_KNOWLEDGE')}
      onGoBack={closeModal}
      onConfirmPress={handleConfirm}
      searchQuery={query}
      onSearchQueryChange={setQuery}
      searchPlaceholder={translate('TEXT_SEARCH_KNOWLEDGE')}
      isLoading={isLoading}
      emptyDescription={translate('TEXT_NO_KNOWLEDGE')}
      data={filteredData}
      renderItem={renderItem}
      keyExtractor={(item) => item.id}
    />
  );
}
