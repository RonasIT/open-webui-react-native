import { ArchivedChatsList } from '@open-web-ui-mobile-client-react-native/mobile/chat/features/archived-chats-list';
import { navigationConfig } from '@open-web-ui-mobile-client-react-native/mobile/shared/utils/navigation';
import { withOfflineGuard } from '@open-web-ui-mobile-client-react-native/shared/features/network';
import { useNavigateOnce } from '@open-web-ui-mobile-client-react-native/shared/utils/navigation';
import { router } from 'expo-router';
import { ReactElement } from 'react';

export default function ArchivedChatsScreen(): ReactElement {
  const navigateOnce = useNavigateOnce();
  const handleChatPress = (id: string): void => navigateOnce(navigationConfig.main.chat.view({ id }));

  const handleSearchPress = (): void =>
    navigateOnce(`${navigationConfig.main.chat.index}/${navigationConfig.main.chat.searchArchivedChats}`);

  return (
    <ArchivedChatsList
      onGoBack={router.back}
      onArchivedChatPress={handleChatPress}
      onSearchPress={withOfflineGuard(handleSearchPress)}
    />
  );
}
