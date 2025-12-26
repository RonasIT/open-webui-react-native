import { useTranslation } from '@ronas-it/react-native-common-modules/i18n';
import { ReactElement, useEffect, useState } from 'react';
import { InteractionManager } from 'react-native';
import { FadeIn } from 'react-native-reanimated';
import { ArchivedChatItem } from '@open-webui-react-native/mobile/chat/features/archived-chat-item';
import {
  useSearchFilters,
  ArchivedChatsFiltersSheet,
} from '@open-webui-react-native/mobile/chat/features/archived-chats-filters-sheet';
import { AppKeyboardAvoidingView } from '@open-webui-react-native/mobile/shared/ui/keyboard-avoiding-view';
import {
  AnimatedView,
  AppFlashList,
  AppSpinner,
  AppText,
  ListEmptyComponent,
  SearchInput,
  View,
} from '@open-webui-react-native/mobile/shared/ui/ui-kit';
import { useBottomInset } from '@open-webui-react-native/mobile/shared/utils/use-bottom-inset';
import { chatApi, ChatListItem } from '@open-webui-react-native/shared/data-access/api';
import { formatDateTime } from '@open-webui-react-native/shared/utils/date';
import { useDebouncedQuery } from '@open-webui-react-native/shared/utils/use-debounced-query';

interface SearchArchivedChatsProps {
  onArchivedChatPress: (id: string) => void;
  onGoBack: () => void;
}

export function SearchArchivedChats({ onArchivedChatPress, onGoBack }: SearchArchivedChatsProps): ReactElement {
  const translate = useTranslation('CHAT.ARCHIVED_CHATS_LIST');
  const bottomInset = useBottomInset();

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
            showsVerticalScrollIndicator={false}
            renderScrollComponent={AppKeyboardAvoidingView}
            renderItem={renderItem}
            ListFooterComponent={isFetchingNextPage ? <AppSpinner /> : null}
            ListEmptyComponent={
              <View className='mt-16'>
                {isLoading ? <AppSpinner /> : <ListEmptyComponent description={translate('TEXT_NO_CHATS')} />}
              </View>
            }
            contentContainerStyle={{ paddingBottom: bottomInset }}
          />
        </AnimatedView>
      )}
    </View>
  );
}
