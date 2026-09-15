import { BottomSheetModal } from '@gorhom/bottom-sheet';
import { ReactElement, useEffect } from 'react';
import { Keyboard } from 'react-native';
import { useDebouncedQuery } from '@open-webui-react-native/shared/utils/use-debounced-query';
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

export interface SearchableListBottomSheetPagination {
  onEndReached: () => void;
  isFetchingNextPage?: boolean;
}

export type SearchableListBottomSheetProps<TItem> = Partial<Omit<AppBottomSheetPropsType, 'ref' | 'content'>> &
  Pick<AppFlashListProps<TItem>, 'data' | 'renderItem' | 'keyExtractor'> & {
    ref?: SearchableListBottomSheetRef;
    title: SheetHeaderProps['title'];
    onGoBack: () => void;
    headerProps?: Pick<SheetHeaderProps, 'accessoryLeft' | 'accessoryRight' | 'onConfirmPress' | 'confirmButtonProps'>;
    searchPlaceholder?: string;
    isLoading?: boolean;
    emptyDescription: string;
    searchPredicate: (item: TItem, query: string) => boolean;
    pagination?: SearchableListBottomSheetPagination;
    // NOTE: clears the search field whenever this value changes, without remounting the sheet
    // itself (a `key` would also tear down and recreate the underlying BottomSheetModal, closing it).
    searchResetKey?: string | number;
  };

export function SearchableListBottomSheet<TItem>({
  ref,
  title,
  onGoBack,
  headerProps,
  searchPlaceholder,
  isLoading,
  emptyDescription,
  data,
  searchPredicate,
  renderItem,
  keyExtractor,
  pagination,
  searchResetKey,
  ...restProps
}: SearchableListBottomSheetProps<TItem>): ReactElement {
  const { query, setQuery } = useDebouncedQuery();

  useEffect(() => {
    setQuery('');
     
  }, [searchResetKey]);

  const handleCancelSearch = (): void => {
    setQuery('');
    Keyboard.dismiss();
  };

  const filteredData = (data ?? []).filter((item) => searchPredicate(item, query));

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
            onGoBack={onGoBack}
            {...headerProps} />
          <SearchInput
            value={query}
            onChangeText={setQuery}
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
                  data={filteredData}
                  renderItem={renderItem}
                  keyExtractor={keyExtractor}
                  className='pb-16'
                  onEndReached={pagination?.onEndReached}
                  onEndReachedThreshold={0.5}
                  ListEmptyComponent={<ListEmptyComponent containerClassName='mt-16' description={emptyDescription} />}
                  ListFooterComponent={
                    pagination?.isFetchingNextPage ? (
                      <View className='py-16'>
                        <AppSpinner />
                      </View>
                    ) : null
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
