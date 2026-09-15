import { BottomSheetModal } from '@gorhom/bottom-sheet';
import { ReactElement } from 'react';
import { Keyboard } from 'react-native';
import { AppBottomSheet, AppBottomSheetPropsType } from '../bottom-sheet';
import { AppFlashList, AppFlashListProps } from '../flash-list';
import { AppBottomSheetKeyboardAwareScrollView } from '../keyboard-aware-scroll-view';
import { ListEmptyComponent } from '../list-empty-component';
import { AppSafeAreaView } from '../safe-area-view';
import { SearchInput } from '../search-input';
import { SheetHeader, SheetHeaderProps } from '../sheet-header';
import { AppSpinner } from '../spinner';
import { View } from '../view';

export type SearchableListBottomSheetRef = React.RefObject<BottomSheetModal | null>;

export type SearchableListBottomSheetProps<TItem> = Partial<Omit<AppBottomSheetPropsType, 'ref' | 'content'>> & {
  ref?: SearchableListBottomSheetRef;
  title: SheetHeaderProps['title'];
  accessoryLeft?: SheetHeaderProps['accessoryLeft'];
  accessoryRight?: SheetHeaderProps['accessoryRight'];
  onGoBack: () => void;
  onConfirmPress?: SheetHeaderProps['onConfirmPress'];
  confirmButtonProps?: SheetHeaderProps['confirmButtonProps'];
  searchQuery: string;
  onSearchQueryChange: (query: string) => void;
  searchPlaceholder?: string;
  isLoading?: boolean;
  emptyDescription: string;
  data: Array<TItem>;
  renderItem: AppFlashListProps<TItem>['renderItem'];
  keyExtractor?: AppFlashListProps<TItem>['keyExtractor'];
};

export function SearchableListBottomSheet<TItem>({
  ref,
  title,
  accessoryLeft,
  accessoryRight,
  onGoBack,
  onConfirmPress,
  confirmButtonProps,
  searchQuery,
  onSearchQueryChange,
  searchPlaceholder,
  isLoading,
  emptyDescription,
  data,
  renderItem,
  keyExtractor,
  ...restProps
}: SearchableListBottomSheetProps<TItem>): ReactElement {
  const handleCancelSearch = (): void => {
    onSearchQueryChange('');
    Keyboard.dismiss();
  };

  return (
    <AppBottomSheet
      {...restProps}
      isModal={true}
      ref={ref}
      isScrollable
      snapPoints={['100%']}
      stackBehavior='push'
      className='px-0'
      content={
        <View className='flex-1 bg-background-primary'>
          <SheetHeader
            title={title}
            accessoryLeft={accessoryLeft}
            accessoryRight={accessoryRight}
            onGoBack={onGoBack}
            onConfirmPress={onConfirmPress}
            confirmButtonProps={confirmButtonProps}
          />
          <SearchInput
            value={searchQuery}
            onChangeText={onSearchQueryChange}
            isInBottomSheet
            onCancel={handleCancelSearch}
            placeholder={searchPlaceholder}
          />
          {isLoading ? (
            <View className='flex-1'>
              <AppSpinner isFullScreen />
            </View>
          ) : (
            <AppBottomSheetKeyboardAwareScrollView>
              <AppSafeAreaView edges={['bottom']}>
                <AppFlashList
                  data={data}
                  renderItem={renderItem}
                  keyExtractor={keyExtractor}
                  className='pb-16'
                  ListEmptyComponent={<ListEmptyComponent containerClassName='mt-16' description={emptyDescription} />}
                />
              </AppSafeAreaView>
            </AppBottomSheetKeyboardAwareScrollView>
          )}
        </View>
      }
    />
  );
}
