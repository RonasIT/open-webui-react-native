import { BottomSheetModal } from '@gorhom/bottom-sheet';
import { ReactElement } from 'react';
import { Keyboard } from 'react-native';
import { AppBottomSheet, AppBottomSheetPropsType } from '../bottom-sheet';
import { AppBottomSheetFlashList } from '../bottom-sheet-flat-list';
import { AppFlashListProps } from '../flash-list';
import { ListEmptyComponent } from '../list-empty-component';
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
  Pick<AppFlashListProps<TItem>, 'data' | 'renderItem' | 'keyExtractor' | 'extraData'> & {
    ref?: SearchableListBottomSheetRef;
    title: SheetHeaderProps['title'];
    onGoBack: () => void;
    onDismiss?: () => void;
    headerProps?: Pick<SheetHeaderProps, 'accessoryLeft' | 'accessoryRight' | 'onConfirmPress' | 'confirmButtonProps'>;
    query: string;
    onQueryChange: (query: string) => void;
    searchPlaceholder?: string;
    isLoading?: boolean;
    emptyDescription: string;
    pagination?: SearchableListBottomSheetPagination;
  };

export function SearchableListBottomSheet<TItem>({
  ref,
  title,
  onGoBack,
  onDismiss,
  headerProps,
  query,
  onQueryChange,
  searchPlaceholder,
  isLoading,
  emptyDescription,
  data,
  renderItem,
  keyExtractor,
  extraData,
  pagination,
  ...restProps
}: SearchableListBottomSheetProps<TItem>): ReactElement {
  const handleCancelSearch = (): void => {
    onQueryChange('');
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
      onDismiss={onDismiss}
      content={
        <View className='flex-1 bg-background-primary'>
          <SheetHeader
            title={title}
            onGoBack={onGoBack}
            {...headerProps} />
          <SearchInput
            value={query}
            onChangeText={onQueryChange}
            isInBottomSheet
            onCancel={handleCancelSearch}
            placeholder={searchPlaceholder}
          />
          {isLoading ? (
            <View className='flex-1'>
              <AppSpinner isFullScreen />
            </View>
          ) : (
            <AppBottomSheetFlashList
              data={data}
              extraData={extraData}
              renderItem={renderItem}
              keyExtractor={keyExtractor}
              className='flex-1'
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
          )}
        </View>
      }
    />
  );
}
