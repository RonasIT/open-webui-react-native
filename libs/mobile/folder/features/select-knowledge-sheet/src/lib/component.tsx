import { TrueSheet } from '@lodev09/react-native-true-sheet';
import { useTranslation } from '@ronas-it/react-native-common-modules/i18n';
import { ForwardedRef, ReactElement, useEffect, useImperativeHandle, useRef, useState } from 'react';
import { Keyboard, TouchableOpacity } from 'react-native';
import uuid from 'react-native-uuid';
import { AppKeyboardAwareScrollView } from '@open-webui-react-native/mobile/shared/ui/keyboard-avoiding-view';
import {
  AppBottomSheet,
  AppBottomSheetPropsType,
  AppFlashList,
  AppSpinner,
  AppText,
  ListEmptyComponent,
  SearchInput,
  SheetHeader,
  View,
} from '@open-webui-react-native/mobile/shared/ui/ui-kit';
import { Knowledge, knowledgeApi } from '@open-webui-react-native/shared/data-access/api';
import { useDebouncedQuery } from '@open-webui-react-native/shared/utils/use-debounced-query';
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
  const sheetRef = useRef<TrueSheet>(null);

  const [selectedKnowledge, setSelectedKnowledge] = useState<Array<Knowledge>>([]);
  const [testData, setTestData] = useState<Array<Knowledge>>([]);

  const { query, setQuery } = useDebouncedQuery();

  const { data: knowledge, isLoading } = knowledgeApi.useGetKnowledge();

  const filteredData = (knowledge ?? []).filter((item) => new RegExp(query, 'i').test(item.name));

  useEffect(() => {
    if (knowledge) {
      setTestData(filteredData);
    }
  }, [knowledge]);

  const addTestKnowledge = (): void => {
    const testKnowledge = new Knowledge({
      accessControl: undefined,
      createdAt: undefined,
      data: undefined,
      deletedAt: undefined,
      description: 'Docs for frontend devs - Next.js and React Native',
      files: undefined,
      id: uuid.v4(),
      meta: null,
      name: 'Test item',
      updatedAt: undefined,
      user: {
        // @ts-expect-error for testing purposes
        createdAt: undefined,
        deletedAt: undefined,
        email: 'ipakhomov@ronasit.com',
        id: '16a66684-d9f0-4379-be4b-08e9cb7e17b8',
        name: 'Ilya Pakhomov',
        permissions: undefined,
        // @ts-expect-error for testing purposes
        profileImageUrl: undefined,
        // @ts-expect-error for testing purposes
        role: 'admin',
        updatedAt: undefined,
      },
      userId: undefined,
    });

    setTestData((prev) => [testKnowledge, ...prev]);
  };

  const closeModal = (): void => {
    sheetRef.current?.dismiss();
  };

  const openModal = (): void => {
    sheetRef.current?.present();
  };

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
      ref={sheetRef}
      cornerRadius={32}
      scrollable
      detents={[1]}
      header={
        <View>
          <SheetHeader
            title={translate('TEXT_SELECT_KNOWLEDGE')}
            onGoBack={closeModal}
            onConfirmPress={handleConfirm}
            className='px-content-offset pt-content-offset'
          />
          <View className='bg-background-primary flex-row justify-center'>
            <TouchableOpacity
              onPress={addTestKnowledge}
              style={{
                padding: 8,
                borderBottomWidth: 1,
                borderTopWidth: 1,
                borderRightWidth: 1,
                borderLeftWidth: 1,
                width: 250,
                borderRadius: 8,
                alignItems: 'center',
                backgroundColor: 'white',
              }}>
              <AppText style={{ color: 'black' }}>Add more test knowledge</AppText>
            </TouchableOpacity>
          </View>
          <SearchInput
            className='bg-background-primary px-content-offset'
            value={query}
            onChangeText={setQuery}
            isInBottomSheet
            onCancel={onCancelPress}
            placeholder={translate('TEXT_SEARCH_KNOWLEDGE')}
          />
        </View>
      }
      content={
        <View className='bg-background-primary'>
          {isLoading ? (
            <View className='flex-1'>
              <AppSpinner isFullScreen />
            </View>
          ) : (
            <AppKeyboardAwareScrollView className='h-full bg-background-primary px-content-offset'>
              <AppFlashList
                data={testData}
                renderItem={renderItem}
                className='pb-16'
                ListEmptyComponent={
                  <ListEmptyComponent containerClassName='mt-16' description={translate('TEXT_NO_KNOWLEDGE')} />
                }
              />
            </AppKeyboardAwareScrollView>
          )}
        </View>
      }
    />
  );
}
