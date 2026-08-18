import { BottomSheetModal } from '@gorhom/bottom-sheet';
import { useTranslation } from '@ronas-it/react-native-common-modules/i18n';
import { ForwardedRef, ReactElement, useImperativeHandle, useRef, useState } from 'react';
import { useColorScheme } from '@open-webui-react-native/mobile/shared/ui/styles';
import {
  AppBottomSheet,
  AppBottomSheetKeyboardAwareScrollView,
  AppBottomSheetPropsType,
  AppFlashList,
  AppPressable,
  AppSafeAreaView,
  AppSpinner,
  AppText,
  BottomSheetTextInput,
  Icon,
  ListEmptyComponent,
  SheetHeader,
  View,
} from '@open-webui-react-native/mobile/shared/ui/ui-kit';
import { AIModel, modelsApi } from '@open-webui-react-native/shared/data-access/api';
import { useDebouncedQuery } from '@open-webui-react-native/shared/utils/use-debounced-query';

export type DefaultModelSheetMethods = {
  present: () => void;
};

export type DefaultModelSheetRef = ForwardedRef<DefaultModelSheetMethods>;

export type DefaultModelSheetProps = Partial<Omit<AppBottomSheetPropsType, 'ref'>> & {
  onConfirm: (modelId: string) => void;
  selectedModelId?: string;
  ref?: DefaultModelSheetRef;
};

export function DefaultModelSheet({ onConfirm, selectedModelId, ref, ...props }: DefaultModelSheetProps): ReactElement {
  const translate = useTranslation('APP.SETTINGS_SCREEN.DEFAULT_MODEL_SHEET');
  const { isDarkColorScheme } = useColorScheme();
  const sheetRef = useRef<BottomSheetModal>(null);

  const [selectedId, setSelectedId] = useState<string | undefined>(selectedModelId);

  const { query, setQuery } = useDebouncedQuery();

  const { data: models, isLoading } = modelsApi.useGetModels();

  const filteredModels = (models ?? []).filter((model) => new RegExp(query, 'i').test(model.name));

  const closeSheet = (): void => sheetRef.current?.close();

  useImperativeHandle(
    ref,
    () => ({
      present: () => {
        setSelectedId(selectedModelId);
        setQuery('');
        sheetRef.current?.present();
      },
    }),
    [selectedModelId],
  );

  const handleConfirmPress = (): void => {
    if (selectedId) {
      onConfirm(selectedId);
    }
    closeSheet();
  };

  const renderItem = ({ item }: { item: AIModel }): ReactElement => (
    <AppPressable onPress={() => setSelectedId(item.id)} className='flex-row items-center gap-16 py-16'>
      <Icon name={isDarkColorScheme ? 'logoSmallDark' : 'logoSmallLight'} className='shrink-0' />
      <AppText numberOfLines={1} className='flex-1'>
        {item.name}
      </AppText>
      {selectedId === item.id && <Icon name='checkedSmall' className='shrink-0' />}
    </AppPressable>
  );

  return (
    <AppBottomSheet
      {...props}
      isModal
      ref={sheetRef}
      isScrollable
      snapPoints={['100%']}
      content={
        <View className='flex-1 bg-background-primary'>
          <SheetHeader
            title={translate('TEXT_TITLE')}
            onGoBack={closeSheet}
            onConfirmPress={handleConfirmPress} />
          <BottomSheetTextInput
            value={query}
            onChangeText={setQuery}
            className='my-8'
            placeholder={translate('TEXT_SEARCH_MODEL')}
            accessoryLeft={<Icon name='search' className='color-text-secondary' />}
          />
          {isLoading ? (
            <View className='flex-1'>
              <AppSpinner isFullScreen />
            </View>
          ) : (
            <AppBottomSheetKeyboardAwareScrollView>
              <AppSafeAreaView edges={['bottom']}>
                <AppFlashList
                  data={filteredModels}
                  extraData={selectedId}
                  renderItem={renderItem}
                  className='pb-16'
                  ListEmptyComponent={
                    <ListEmptyComponent containerClassName='mt-16' description={translate('TEXT_NO_MODELS')} />
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
