import { useTranslation } from '@ronas-it/react-native-common-modules/i18n';
import { ReactElement, useEffect, useState } from 'react';
import { InteractionManager } from 'react-native';
import { FadeIn } from 'react-native-reanimated';
import { ArchivedChatItem } from '@open-web-ui-mobile-client-react-native/mobile/chat/features/archived-chat-item';
import {
  useSearchFilters,
  ArchivedChatsFiltersSheet,
} from '@open-web-ui-mobile-client-react-native/mobile/chat/features/archived-chats-filters-sheet';
import { AppKeyboardAvoidingView } from '@open-web-ui-mobile-client-react-native/mobile/shared/ui/keyboard-avoiding-view';
import {
  AnimatedView,
  AppFlashList,
  AppSpinner,
  AppText,
  ListEmptyComponent,
  SearchInput,
  View,
} from '@open-web-ui-mobile-client-react-native/mobile/shared/ui/ui-kit';
import { chatApi, ChatListItem } from '@open-web-ui-mobile-client-react-native/shared/data-access/api';
import { formatDateTime } from '@open-web-ui-mobile-client-react-native/shared/utils/date';
import { useDebouncedQuery } from '@open-web-ui-mobile-client-react-native/shared/utils/use-debounced-query';

interface SearchArchivedChatsProps {
  onArchivedChatPress: (id: string) => void;
  onGoBack: () => void;
}

export function SearchArchivedChats({ onArchivedChatPress, onGoBack }: SearchArchivedChatsProps): ReactElement {
  const translate = useTranslation('CHAT.ARCHIVED_CHATS_LIST');

  const { filters, selectedFilter, handleFilterPress } = useSearchFilters();

  const { query, setQuery, debouncedQuery } = useDebouncedQuery({ delay: 300 });
  const [isFocused, setIsFocused] = useState(false);

  const { data, isLoading, fetchNextPage, isFetchingNextPage } = chatApi.useGetArchivedChatList({
    query: debouncedQuery,
    orderBy: selectedFilter.orderBy,
    direction: selectedFilter.direction,
  });

  const renderItem = ({ item }: { item: ChatListItem }): ReactElement => (
    <ArchivedChatItem
      item={item}
      onItemPress={onArchivedChatPress}
      accessoryRight={
        <AppText className='text-xs-sm sm:text-xs text-text-secondary text-wrap text-right ml-8'>
          {formatDateTime(item.updatedAt, 'relative-time')}
        </AppText>
      }
    />
  );

  useEffect(() => {
    InteractionManager.runAfterInteractions(() => {
      setIsFocused(true);
    });
  }, []);

  return (
    <View className='flex-1 pt-safe bg-background-primary'>
      <SearchInput
        onCancel={onGoBack}
        value={query}
        autoFocus
        className='px-content-offset'
        onChangeText={setQuery} />
      <ArchivedChatsFiltersSheet
        filters={filters}
        selectedFilter={selectedFilter}
        onFilterPress={handleFilterPress} />
      {isFocused && (
        <AnimatedView className='flex-1' entering={FadeIn.duration(50)}>
          <AppFlashList
            data={data || []}
            onEndReached={fetchNextPage}
            keyboardShouldPersistTaps='handled'
            estimatedItemSize={52}
            showsVerticalScrollIndicator={false}
            renderScrollComponent={AppKeyboardAvoidingView}
            renderItem={renderItem}
            ListFooterComponent={isFetchingNextPage ? <AppSpinner /> : null}
            ListEmptyComponent={
              <View className='mt-16'>
                {isLoading ? <AppSpinner /> : <ListEmptyComponent description={translate('TEXT_NO_CHATS')} />}
              </View>
            }
            contentContainerClassName='pb-safe android:pb-16'
          />
        </AnimatedView>
      )}
    </View>
  );
}
