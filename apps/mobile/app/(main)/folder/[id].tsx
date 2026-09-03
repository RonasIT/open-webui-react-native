import { ChatsList } from '@open-webui-react-native/mobile/folder/features/chats-list';
import { AppHeader, AppScreen, IconButton } from '@open-webui-react-native/mobile/shared/ui/ui-kit';
import { FolderScreenParams, navigationConfig } from '@open-webui-react-native/mobile/shared/utils/navigation';
import { AccessPermission, foldersApi } from '@open-webui-react-native/shared/data-access/api';
import { useNavigateOnce } from '@open-webui-react-native/shared/utils/navigation';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ReactElement } from 'react';

export default function FolderScreen(): ReactElement {
  const navigateOnce = useNavigateOnce();
  const { id, title }: FolderScreenParams = useLocalSearchParams();
  const router = useRouter();

  const { data: sharedFolders, isPending: isSharedFoldersPending } = foldersApi.useGetSharedFolders();

  // NOTE: A chat may only be created in a folder the user has a write grant on — the backend answers
  // 404 otherwise. Folders missing from the shared list are the user's own, so they always allow it;
  // until the list is there the access level is unknown, so the action stays hidden.
  const sharedFolder = sharedFolders?.find((folder) => folder.id === id);
  const canCreateChat =
    !isSharedFoldersPending && (!sharedFolder || sharedFolder.permission === AccessPermission.WRITE);

  const handleNewChatPress = (): void =>
    navigateOnce({
      pathname: `${navigationConfig.main.chat.index}/${navigationConfig.main.chat.create}`,
      params: { folderId: id },
    });

  const handleChatPress = (id: string): void => navigateOnce(navigationConfig.main.chat.view({ id }));

  return (
    <AppScreen
      noOutsideSpacing
      scrollDisabled
      header={
        <AppHeader
          title={title}
          onGoBack={router.back}
          titleClassName='max-w-[65%]'
          accessoryRight={
            canCreateChat ? (
              <IconButton
                className='p-0'
                iconName='plusInCircle'
                onPress={handleNewChatPress} />
            ) : undefined
          }
        />
      }>
      <ChatsList folderId={id} onChatPress={handleChatPress} />
    </AppScreen>
  );
}
