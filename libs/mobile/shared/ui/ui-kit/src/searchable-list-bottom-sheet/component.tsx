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
  Pick<AppFlashListProps<TItem>, 'data' | 'renderItem' | 'extraData' | 'showsVerticalScrollIndicator'> & {
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

type KeyExtractor<TItem> = NonNullable<AppFlashListProps<TItem>['keyExtractor']>;

// NOTE: keyExtractor defaults to item.id, but only when TItem actually has one — a list mixing
// section headers/empty-states with real entities (see select-knowledge-sheet) has no shared id
// field, so that shape must keep passing its own keyExtractor.
export function SearchableListBottomSheet<TItem extends { id: string }>(
  props: SearchableListBottomSheetProps<TItem> & { keyExtractor?: KeyExtractor<TItem> },
): ReactElement;
export function SearchableListBottomSheet<TItem>(
  props: SearchableListBottomSheetProps<TItem> & { keyExtractor: KeyExtractor<TItem> },
): ReactElement;

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
  keyExtractor = (item) => (item as { id: string }).id,
  extraData,
  showsVerticalScrollIndicator,
  pagination,
  ...restProps
}: SearchableListBottomSheetProps<TItem> & { keyExtractor?: KeyExtractor<TItem> }): ReactElement {
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
              showsVerticalScrollIndicator={showsVerticalScrollIndicator}
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
