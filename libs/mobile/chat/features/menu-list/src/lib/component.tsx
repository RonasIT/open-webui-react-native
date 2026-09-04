import { useTranslation } from '@ronas-it/react-native-common-modules/i18n';
import { useIsFocused } from 'expo-router';
import { Fragment, ReactElement, useCallback, useEffect, useRef, useState } from 'react';
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
import { useBottomInset } from '@open-webui-react-native/mobile/shared/utils/use-bottom-inset';
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
  const isFocused = useIsFocused();
  const bottomInset = useBottomInset();

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
  const {
    data: sharedFolders,
    isLoading: isSharedFoldersLoading,
    isRefetching: isSharedFoldersRefetching,
    refetch: refetchSharedFolders,
  } = foldersApi.useGetSharedFolders();

  const isLoading =
    isChatsLoading || isPinnedChatsLoading || isFoldersLoading || isSharedFoldersLoading || isFirstLoading;
  const isRefetching = isChatsRefetching || isPinnedChatsRefetching || isFoldersRefetching || isSharedFoldersRefetching;

  const refetch = (): void => {
    Promise.all([refetchChats(), refetchPinnedChats(), refetchFolders(), refetchSharedFolders()]);
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
          refreshControl={<AppRefreshControl onRefresh={refetch} refreshing={isFocused && isRefetching} />}
          ListHeaderComponent={
            <View>
              {isFeatureEnabled(FeatureID.CHAT_FOLDERS) && (
                <Fragment>
                  {/* NOTE: A folder owned by somebody else cannot be renamed or deleted by the
                      recipient, so its row offers no actions on long press. */}
                  <FoldersList
                    folders={sharedFolders || []}
                    title={translate('TEXT_SHARED_WITH_ME')}
                    onFolderPress={onFolderPress}
                  />
                  <FoldersList
                    folders={folders || []}
                    title={translate('TEXT_MY_FOLDERS')}
                    onFolderPress={onFolderPress}
                    onFolderLongPress={onFolderLongPress}
                  />
                </Fragment>
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
          contentContainerClassName='mt-12'
          contentContainerStyle={{ paddingBottom: bottomInset }}
          showsVerticalScrollIndicator={false}
        />
      )}
      <ChatActionsMenuSheet ref={chatActionsSheetRef} goToChat={onChatPress} />
    </View>
  );
}
