import { useTranslation } from '@ronas-it/react-native-common-modules/i18n';
import { ReactElement, useCallback, useRef } from 'react';
import { FadeIn } from 'react-native-reanimated';
import {
  ChatActionsMenuSheet,
  ChatActionsMenuSheetMethods,
} from '@open-webui-react-native/mobile/shared/features/chat-actions-menu-sheet';
import { ChatListRow } from '@open-webui-react-native/mobile/shared/ui/chat-list-row';
import {
  AnimatedView,
  AppFlashList,
  AppRefreshControl,
  AppSpinner,
  ListEmptyComponent,
  View,
} from '@open-webui-react-native/mobile/shared/ui/ui-kit';
import { ChatListItem, foldersApi } from '@open-webui-react-native/shared/data-access/api';

interface FolderChatsListProps {
  folderId: string;
  onChatPress: (id: string) => void;
}

export function ChatsList({ folderId, onChatPress }: FolderChatsListProps): ReactElement {
  const translate = useTranslation('FOLDER.CHATS_LIST');
  const chatActionsSheetRef = useRef<ChatActionsMenuSheetMethods>(null);

  const {
    data: chats,
    isFetchingNextPage,
    isLoading: isChatsLoading,
    isFetching: isChatsFetching,
    isRefetching: isChatsRefetching,
    fetchNextPage,
    refetch,
  } = foldersApi.useGetFolderChatList(folderId);

  const isLoading = isChatsLoading || (!isFetchingNextPage && isChatsFetching && !isChatsRefetching);

  const renderItem = useCallback(
    ({ item }: { item: ChatListItem }) => (
      <ChatListRow
        title={item.title}
        onPress={onChatPress}
        onLongPress={() => chatActionsSheetRef.current?.present(item, folderId)}
        chatId={item.id}
      />
    ),
    [onChatPress],
  );

  return (
    <AnimatedView className='flex-1' entering={FadeIn.duration(50)}>
      <AppFlashList
        data={chats || []}
        renderItem={renderItem}
        showsVerticalScrollIndicator={false}
        refreshControl={<AppRefreshControl onRefresh={refetch} refreshing={isChatsRefetching} />}
        ListEmptyComponent={
          <View className='mt-16'>
            {isLoading ? <AppSpinner /> : <ListEmptyComponent description={translate('TEXT_NO_CHATS')} />}
          </View>
        }
        onEndReached={fetchNextPage}
        ListFooterComponent={isFetchingNextPage ? <AppSpinner /> : null}
        contentContainerClassName='pb-16 pt-12'
      />
      <ChatActionsMenuSheet ref={chatActionsSheetRef} goToChat={onChatPress} />
    </AnimatedView>
  );
}
