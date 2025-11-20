import { BottomSheetModal } from '@gorhom/bottom-sheet';
import { useTranslation } from '@ronas-it/react-native-common-modules/i18n';
import { ForwardedRef, ReactElement, useImperativeHandle, useRef, useState } from 'react';
import { Keyboard } from 'react-native';
import {
  AppBottomSheet,
  AppBottomSheetKeyboardAwareScrollView,
  AppBottomSheetPropsType,
  AppFlashList,
  AppSafeAreaView,
  AppSpinner,
  ListEmptyComponent,
  SearchInput,
  SheetHeader,
  View,
} from '@open-web-ui-mobile-client-react-native/mobile/shared/ui/ui-kit';
import { Knowledge, knowledgeApi } from '@open-web-ui-mobile-client-react-native/shared/data-access/api';
import { useDebouncedQuery } from '@open-web-ui-mobile-client-react-native/shared/utils/use-debounced-query';
import { KnowledgeRow } from './components';

export type SelectKnowledgeSheetMethods = {
  present: (selectedKnowledge: Array<Knowledge>) => void;
};

export type SelectKnowledgeSheetRef = ForwardedRef<SelectKnowledgeSheetMethods>;

export type SelectKnowledgeSheetProps = Partial<Omit<AppBottomSheetPropsType, 'ref'>> & {
  onConfirm: (selectedKnowledge: Array<Knowledge>) => void;
  ref?: SelectKnowledgeSheetRef;
};

export function SelectKnowledgeSheet({ onConfirm, ref, ...props }: SelectKnowledgeSheetProps): ReactElement {
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

  const onCancelPress = (): void => {
    setQuery('');
    Keyboard.dismiss();
  };

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
    <AppBottomSheet
      {...props}
      isModal={true}
      ref={sheetRef}
      isScrollable
      snapPoints={['100%']}
      stackBehavior='push'
      className='px-0'
      content={
        <View className='flex-1 bg-background-primary'>
          <SheetHeader
            title={translate('TEXT_SELECT_KNOWLEDGE')}
            onGoBack={closeModal}
            onConfirmPress={handleConfirm}
            className='px-16'
          />
          <SearchInput
            value={query}
            onChangeText={setQuery}
            isInBottomSheet
            className='px-16'
            onCancel={onCancelPress}
          />
          {isLoading ? (
            <View className='flex-1'>
              <AppSpinner isFullScreen />
            </View>
          ) : (
            <AppBottomSheetKeyboardAwareScrollView>
              <AppSafeAreaView edges={['bottom']}>
                <AppFlashList
                  data={filteredData}
                  renderItem={renderItem}
                  className='pb-16'
                  ListEmptyComponent={
                    <ListEmptyComponent containerClassName='mt-16' description={translate('TEXT_NO_KNOWLEDGE')} />
                  }
                />
              </AppSafeAreaView>
            </AppBottomSheetKeyboardAwareScrollView>
          )}
        </View>
      }
    />
  );
}
