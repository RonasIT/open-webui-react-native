import { ChatMenuList } from '@open-webui-react-native/mobile/chat/features/menu-list';
import {
  FolderActionsSheet,
  FolderActionsSheetMethods,
} from '@open-webui-react-native/mobile/folder/features/folder-actions-sheet';
import {
  UpsertFolderSheet,
  UpsertFolderSheetMethods,
} from '@open-webui-react-native/mobile/folder/features/upsert-folder-sheet';
import { ProfileMenuSheet } from '@open-webui-react-native/mobile/shared/features/profile-menu-sheet';
import { ScreenWrapper } from '@open-webui-react-native/mobile/shared/ui/screen-wrapper';
import { AppHeader, IconButton, View } from '@open-webui-react-native/mobile/shared/ui/ui-kit';
import { navigationConfig } from '@open-webui-react-native/mobile/shared/utils/navigation';
import { FolderListItem } from '@open-webui-react-native/shared/data-access/api';
import { withOfflineGuard } from '@open-webui-react-native/shared/features/network';
import { FeatureID, isFeatureEnabled } from '@open-webui-react-native/shared/utils/feature-flag';
import { useNavigateOnce } from '@open-webui-react-native/shared/utils/navigation';
import { useTranslation } from '@ronas-it/react-native-common-modules/i18n';
import { router } from 'expo-router';
import { ReactElement, useRef } from 'react';

export default function ChatListScreen(): ReactElement {
  const navigateOnce = useNavigateOnce();
  const translate = useTranslation('APP.CHAT_LIST_SCREEN');
  const folderActionsSheetRef = useRef<FolderActionsSheetMethods>(null);
  const upsertFolderSheetRef = useRef<UpsertFolderSheetMethods>(null);

  const handleChatPress = (id: string): void => navigateOnce(navigationConfig.main.chat.view({ id }));

  const handleNewChatPress = (): void =>
    navigateOnce(`${navigationConfig.main.chat.index}/${navigationConfig.main.chat.create}`);

  const handleArchivedChatsPress = (): void =>
    navigateOnce(`${navigationConfig.main.chat.index}/${navigationConfig.main.chat.archivedChats}`);

  const handleFolderPress = (id: string, title: string): void =>
    router.navigate(navigationConfig.main.folder.view({ id, title }));

  const openFolderActions = (folder: FolderListItem): void => folderActionsSheetRef.current?.present(folder);

  const openEditFolderModal = (id: string): void => upsertFolderSheetRef.current?.present(id);

  const handleSearchPress = (): void =>
    navigateOnce(`${navigationConfig.main.chat.index}/${navigationConfig.main.chat.search}`);

  return (
    <ScreenWrapper safeAreaProps={{ edges: [] }} screenProps={{ noOutsideSpacing: true, scrollDisabled: true }}>
      <View className='flex-1 bg-background-primary mt-safe'>
        <AppHeader
          className='mt-0'
          title={translate('TEXT_CHATS')}
          accessoryLeft={<ProfileMenuSheet onArchivedChatsPress={handleArchivedChatsPress} />}
          accessoryRight={
            <View className='flex-row gap-12'>
              {isFeatureEnabled(FeatureID.CHAT_FOLDERS) && (
                <UpsertFolderSheet
                  renderTrigger={({ onPress }) => (
                    <IconButton
                      className='p-0'
                      iconName='folderPlus'
                      onPress={withOfflineGuard(onPress)} />
                  )}
                />
              )}
              <IconButton
                className='p-0'
                iconName='plusInCircle'
                onPress={handleNewChatPress} />
            </View>
          }
        />
        <ChatMenuList
          onSearchPress={withOfflineGuard(handleSearchPress)}
          onChatPress={handleChatPress}
          onFolderPress={handleFolderPress}
          onFolderLongPress={openFolderActions}
        />
        <FolderActionsSheet ref={folderActionsSheetRef} onEditPress={openEditFolderModal} />
        <UpsertFolderSheet ref={upsertFolderSheetRef} />
      </View>
    </ScreenWrapper>
  );
}
