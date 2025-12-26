import { useTranslation } from '@ronas-it/react-native-common-modules/i18n';
import { ReactElement, useCallback, useEffect, useRef, useState } from 'react';
import {
  ChatActionsMenuSheet,
  ChatActionsMenuSheetMethods,
} from '@open-webui-react-native/mobile/shared/features/chat-actions-menu-sheet';
import { ChatListRow } from '@open-webui-react-native/mobile/shared/ui/chat-list-row';
import { DateSectionList } from '@open-webui-react-native/mobile/shared/ui/date-section-list';
import {
  AppRefreshControl,
  AppSpinner,
  ListEmptyComponent,
  PressableSearchInput,
  View,
} from '@open-webui-react-native/mobile/shared/ui/ui-kit';
import { chatApi, ChatListItem, FolderListItem, foldersApi } from '@open-webui-react-native/shared/data-access/api';
import { formatDateTime } from '@open-webui-react-native/shared/utils/date';
import { FeatureID, isFeatureEnabled } from '@open-webui-react-native/shared/utils/feature-flag';
import { FoldersList, PinnedChatList } from './components';

interface ChatMenuListProps {
  onChatPress: (id: string) => void;
  onFolderPress: (id: string, title: string) => void;
  onFolderLongPress: (folder: FolderListItem) => void;
  onSearchPress: () => void;
}

const transformSectionTitle = (item: ChatListItem): string => {
  return formatDateTime(item.updatedAt, 'relative');
};

export function ChatMenuList({
  onChatPress,
  onFolderPress,
  onFolderLongPress,
  onSearchPress,
}: ChatMenuListProps): ReactElement {
  const translate = useTranslation('CHAT.CHAT_MENU_LIST');
  const chatActionsSheetRef = useRef<ChatActionsMenuSheetMethods>(null);

  const [isFirstLoading, setIsFirstLoading] = useState<boolean>(true);

  const {
    data: chats,
    isFetchingNextPage,
    isLoading: isChatsLoading,
    isRefetching: isChatsRefetching,
    fetchNextPage,
    refetch: refetchChats,
  } = chatApi.useGetChatList();
  const {
    data: pinnedChats,
    isLoading: isPinnedChatsLoading,
    isRefetching: isPinnedChatsRefetching,
    refetch: refetchPinnedChats,
  } = chatApi.useGetPinnedChatList();
  const {
    data: folders,
    isLoading: isFoldersLoading,
    isRefetching: isFoldersRefetching,
    refetch: refetchFolders,
  } = foldersApi.useGetFolders();

  const isLoading = isChatsLoading || isPinnedChatsLoading || isFoldersLoading || isFirstLoading;
  const isRefetching = isChatsRefetching || isPinnedChatsRefetching || isFoldersRefetching;

  const refetch = (): void => {
    Promise.all([refetchChats(), refetchPinnedChats(), refetchFolders()]);
  };

  useEffect(() => {
    if (isFirstLoading && !isRefetching) {
      setIsFirstLoading(false);
    }
  }, [isFirstLoading, isRefetching]);

  const renderItem = useCallback(
    ({ item }: { item: ChatListItem }) => (
      <ChatListRow
        title={item.title}
        onPress={onChatPress}
        chatId={item.id}
        onLongPress={() => chatActionsSheetRef.current?.present(item)}
      />
    ),
    [onChatPress],
  );

  return (
    <View className='flex-1'>
      <PressableSearchInput onPress={onSearchPress} containerClassName='mx-16 pt-8' />
      {isLoading ? (
        <View className='flex-1 items-center justify-center'>
          <AppSpinner />
        </View>
      ) : (
        <DateSectionList
          data={chats || []}
          renderItem={renderItem}
          transformSectionTitle={transformSectionTitle}
          onEndReached={fetchNextPage}
          refreshControl={<AppRefreshControl onRefresh={refetch} refreshing={isRefetching} />}
          ListHeaderComponent={
            <View>
              {isFeatureEnabled(FeatureID.CHAT_FOLDERS) && (
                <FoldersList
                  folders={folders || []}
                  onFolderPress={onFolderPress}
                  onFolderLongPress={onFolderLongPress}
                />
              )}
              <PinnedChatList chats={pinnedChats || []} onChatPress={onChatPress} />
            </View>
          }
          ListEmptyComponent={
            <ListEmptyComponent
              description={translate('TEXT_THERE_ARE_NO_CHATS')}
              descriptionClassName='text-sm-sm sm:text-sm'
            />
          }
          ListFooterComponent={isFetchingNextPage ? <AppSpinner /> : null}
          contentContainerClassName='mt-12 pb-safe android:pb-24'
          showsVerticalScrollIndicator={false}
        />
      )}
      <ChatActionsMenuSheet ref={chatActionsSheetRef} goToChat={onChatPress} />
    </View>
  );
}
