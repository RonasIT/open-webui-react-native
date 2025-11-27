import { useTranslation } from '@ronas-it/react-native-common-modules/i18n';
import { ReactElement, useEffect } from 'react';
import { ArchivedChatItem } from '@open-webui-react-native/mobile/chat/features/archived-chat-item';
import {
  useSearchFilters,
  ArchivedChatsFiltersSheet,
} from '@open-webui-react-native/mobile/chat/features/archived-chats-filters-sheet';
import { DateSectionList } from '@open-webui-react-native/mobile/shared/ui/date-section-list';
import {
  AppHeader,
  AppKeyboardControllerView,
  AppRefreshControl,
  AppScreen,
  AppSpinner,
  IconButton,
  ListEmptyComponent,
  PressableSearchInput,
  View,
} from '@open-webui-react-native/mobile/shared/ui/ui-kit';
import { chatApi, ChatListItem } from '@open-webui-react-native/shared/data-access/api';
import { formatDateTime } from '@open-webui-react-native/shared/utils/date';
import { ArchivedChatsActionsSheet } from './components';

interface ArchivedChatsListProps {
  onArchivedChatPress: (id: string) => void;
  onGoBack: () => void;
  onSearchPress: () => void;
}

export function ArchivedChatsList({
  onArchivedChatPress,
  onGoBack,
  onSearchPress,
}: ArchivedChatsListProps): ReactElement {
  const translate = useTranslation('CHAT.ARCHIVED_CHATS_LIST');

  const { filters, selectedFilter, handleFilterPress, resetFilter } = useSearchFilters();

  const {
    data,
    isLoading: isChatsLoading,
    isFetching: isChatsFetching,
    fetchNextPage,
    isFetchingNextPage,
    refetch: refetchChats,
    isRefetching: isChatsRefetching,
  } = chatApi.useGetArchivedChatList({
    orderBy: selectedFilter.orderBy,
    direction: selectedFilter.direction,
  });

  const isLoading = isChatsLoading || (!isFetchingNextPage && isChatsFetching && !isChatsRefetching);

  const transformSectionTitle = (item: ChatListItem): string => {
    return formatDateTime(item.updatedAt, 'relative');
  };

  const renderItem = ({ item }: { item: ChatListItem }): ReactElement => (
    <ArchivedChatItem item={item} onItemPress={onArchivedChatPress} />
  );

  useEffect(() => {
    return () => {
      resetFilter();
    };
  }, []);

  const renderSeparator = (): ReactElement => <View className='h-2' />;

  return (
    <AppScreen
      noOutsideSpacing
      scrollDisabled
      header={
        <AppHeader
          title={translate('TEXT_ARCHIVED_CHATS')}
          onGoBack={onGoBack}
          accessoryRight={
            <ArchivedChatsActionsSheet
              renderTrigger={({ onPress }) => <IconButton iconName='moreDots' onPress={onPress} />}
            />
          }
        />
      }>
      <AppKeyboardControllerView>
        <View className='flex-1'>
          <PressableSearchInput containerClassName='px-content-offset' onPress={onSearchPress} />
          {isLoading ? (
            <View className='flex-1 justify-center items-center'>
              <AppSpinner />
            </View>
          ) : (
            <DateSectionList
              data={data || []}
              onEndReached={fetchNextPage}
              refreshControl={<AppRefreshControl onRefresh={refetchChats} refreshing={isChatsRefetching} />}
              ListHeaderComponent={
                <ArchivedChatsFiltersSheet
                  filters={filters}
                  selectedFilter={selectedFilter}
                  onFilterPress={handleFilterPress}
                />
              }
              transformSectionTitle={transformSectionTitle}
              keyboardShouldPersistTaps='handled'
              estimatedItemSize={32}
              showsVerticalScrollIndicator={false}
              ItemSeparatorComponent={renderSeparator}
              renderItem={renderItem}
              ListFooterComponent={isFetchingNextPage ? <AppSpinner /> : null}
              ListEmptyComponent={
                <ListEmptyComponent containerClassName='mt-16' description={translate('TEXT_NO_CHATS')} />
              }
              contentContainerClassName='pb-safe android:pb-16'
            />
          )}
        </View>
      </AppKeyboardControllerView>
    </AppScreen>
  );
}
