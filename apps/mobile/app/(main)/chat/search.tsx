import { SearchChatsList } from '@open-webui-react-native/mobile/chat/features/search-chats-list';
import { navigationConfig } from '@open-webui-react-native/mobile/shared/utils/navigation';
import { router } from 'expo-router';
import { ReactElement } from 'react';

export default function SearchChatScreen(): ReactElement {
  const handleChatPress = (id: string): void => {
    router.replace(navigationConfig.main.chat.view({ id }));
  };

  const handleCancelPress = (): void => router.back();

  return <SearchChatsList onChatPress={handleChatPress} onCancelPress={handleCancelPress} />;
}
