import { ChatsList } from '@open-webui-react-native/mobile/folder/features/chats-list';
import { AppHeader, AppScreen, IconButton } from '@open-webui-react-native/mobile/shared/ui/ui-kit';
import { FolderScreenParams, navigationConfig } from '@open-webui-react-native/mobile/shared/utils/navigation';
import { useNavigateOnce } from '@open-webui-react-native/shared/utils/navigation';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ReactElement } from 'react';

export default function FolderScreen(): ReactElement {
  const navigateOnce = useNavigateOnce();
  const { id, title }: FolderScreenParams = useLocalSearchParams();
  const router = useRouter();

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
          accessoryRight={<IconButton
            className='p-0'
            iconName='plusInCircle'
            onPress={handleNewChatPress} />}
        />
      }>
      <ChatsList folderId={id} onChatPress={handleChatPress} />
    </AppScreen>
  );
}
