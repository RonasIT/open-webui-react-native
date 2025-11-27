import { SearchArchivedChats } from '@open-webui-react-native/mobile/chat/features/search-archived-chats';
import { navigationConfig } from '@open-webui-react-native/mobile/shared/utils/navigation';
import { router } from 'expo-router';
import { ReactElement } from 'react';

export default function SearchArchivedChatsScreen(): ReactElement {
  const handleArchivedChatPress = (id: string): void => {
    router.replace(navigationConfig.main.chat.view({ id }));
  };

  const handleCancelPress = (): void => router.back();

  return <SearchArchivedChats onArchivedChatPress={handleArchivedChatPress} onGoBack={handleCancelPress} />;
}
