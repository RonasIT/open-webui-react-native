import { useTranslation } from '@ronas-it/react-native-common-modules/i18n';
import { ReactElement, useCallback, useEffect, useState } from 'react';
import { InteractionManager } from 'react-native';
import { FadeIn } from 'react-native-reanimated';
import { ChatListRow } from '@open-webui-react-native/mobile/shared/ui/chat-list-row';
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
import { chatApi, ChatListItem } from '@open-webui-react-native/shared/data-access/api';
import { formatDateTime } from '@open-webui-react-native/shared/utils/date';
import { useDebouncedQuery } from '@open-webui-react-native/shared/utils/use-debounced-query';

interface SearchChatsListProps {
  onChatPress: (id: string) => void;
  onCancelPress: () => void;
}

export function SearchChatsList({ onChatPress, onCancelPress }: SearchChatsListProps): ReactElement {
  const translate = useTranslation('CHAT.SEARCH_CHATS_LIST');
  const { setQuery, debouncedQuery } = useDebouncedQuery({ delay: 300 });
  const [isSearchFocused, setIsSearchFocused] = useState(false);

  useEffect(() => {
    InteractionManager.runAfterInteractions(() => {
      setIsSearchFocused(true);
    });
  }, []);

  const { data: chats, isLoading, isFetchingNextPage, fetchNextPage } = chatApi.useSearchInfinite(debouncedQuery);

  const renderItem = useCallback(
    ({ item }: { item: ChatListItem }) => (
      <ChatListRow
        chatId={item.id}
        onPress={() => onChatPress(item.id)}
        title={item.title}
        accessoryRight={
          <AppText className='text-xs-sm sm:text-xs text-text-secondary text-wrap text-right ml-8'>
            {formatDateTime(item.updatedAt, 'relative-time')}
          </AppText>
        }
      />
    ),
    [],
  );

  return (
    <View className='flex-1 bg-background-primary pt-safe'>
      <SearchInput
        className='px-16'
        onCancel={onCancelPress}
        onChangeText={setQuery}
        autoFocus />
      {isSearchFocused && (
        <AnimatedView className='flex-1' entering={FadeIn.duration(50)}>
          <AppFlashList
            data={chats || []}
            renderItem={renderItem}
            keyboardShouldPersistTaps='handled'
            onEndReached={fetchNextPage}
            ListEmptyComponent={
              <View className='mt-16'>
                {isLoading ? <AppSpinner /> : <ListEmptyComponent description={translate('TEXT_THERE_ARE_NO_CHATS')} />}
              </View>
            }
            estimatedItemSize={52}
            renderScrollComponent={AppKeyboardAvoidingView}
            ListFooterComponent={isFetchingNextPage ? <AppSpinner /> : null}
            showsVerticalScrollIndicator={false}
            contentContainerClassName='pb-16 bg-background-primary pt-18'
          />
        </AnimatedView>
      )}
    </View>
  );
}
