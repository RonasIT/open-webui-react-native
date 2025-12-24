import { useTranslation } from '@ronas-it/react-native-common-modules/i18n';
import { ReactElement, useRef } from 'react';
import {
  ChatActionsMenuSheet,
  ChatActionsMenuSheetMethods,
} from '@open-webui-react-native/mobile/shared/features/chat-actions-menu-sheet';
import { ChatListRow } from '@open-webui-react-native/mobile/shared/ui/chat-list-row';
import { AppText, View } from '@open-webui-react-native/mobile/shared/ui/ui-kit';
import { ChatListItem } from '@open-webui-react-native/shared/data-access/api';

export interface PinnedChatListProps {
  chats: Array<ChatListItem>;
  onChatPress: (id: string) => void;
  selectedChatId?: string;
}

export function PinnedChatList({ chats, selectedChatId, onChatPress }: PinnedChatListProps): ReactElement {
  const translate = useTranslation('CHAT.CHAT_MENU_LIST.PINNED_CHAT_LIST');
  const chatActionsSheetRef = useRef<ChatActionsMenuSheetMethods>(null);

  const renderChatRow = (chat: ChatListItem): ReactElement => {
    const isSelected = chat.id === selectedChatId;

    return (
      <ChatListRow
        key={chat.id}
        onPress={onChatPress}
        title={chat.title}
        chatId={chat.id}
        isSelected={isSelected}
        onLongPress={() => chatActionsSheetRef.current?.present(chat)}
      />
    );
  };

  return chats.length > 0 ? (
    <View>
      <AppText className='px-16 py-10 text-md-sm sm:text-sm text-text-secondary'>{translate('TEXT_PINNED')}</AppText>
      {chats.map(renderChatRow)}
      <ChatActionsMenuSheet
        ref={chatActionsSheetRef}
        goToChat={onChatPress}
        isPinned />
    </View>
  ) : (
    <View />
  );
}
